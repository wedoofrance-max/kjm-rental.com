import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const bookingReference = formData.get('bookingReference') as string;
    const customerName = formData.get('customerName') as string;
    const confirmEmail = formData.get('confirmEmail') as string;
    const signature = formData.get('signature') as string;
    const agreedAt = formData.get('agreedAt') as string;
    const idDocument = formData.get('idDocument') as File;
    const passportDocument = formData.get('passportDocument') as File;

    // Validation
    if (!bookingReference || !customerName || !confirmEmail || !signature || !idDocument || !passportDocument) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get booking to verify it exists
    const booking = await prisma.booking.findUnique({
      where: { reference: bookingReference },
      include: { customer: true, vehicle: true, fleetUnit: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Create documents directory if it doesn't exist
    const docsDir = path.join(process.cwd(), 'public', 'contracts', bookingReference);
    await mkdir(docsDir, { recursive: true });

    // Save ID document
    const idBuffer = await idDocument.arrayBuffer();
    const idExt = idDocument.name.split('.').pop();
    const idFileName = `id.${idExt}`;
    const idPath = path.join(docsDir, idFileName);
    await writeFile(idPath, Buffer.from(idBuffer));

    // Save passport document
    const passportBuffer = await passportDocument.arrayBuffer();
    const passportExt = passportDocument.name.split('.').pop();
    const passportFileName = `passport.${passportExt}`;
    const passportPath = path.join(docsDir, passportFileName);
    await writeFile(passportPath, Buffer.from(passportBuffer));

    // Save signature image
    const signatureBase64 = signature.replace(/^data:image\/png;base64,/, '');
    const signatureBuffer = Buffer.from(signatureBase64, 'base64');
    const signaturePath = path.join(docsDir, 'signature.png');
    await writeFile(signaturePath, signatureBuffer);

    // Create contract signing record
    const contractHash = crypto
      .createHash('sha256')
      .update(bookingReference + agreedAt + customerName)
      .digest('hex');

    const contract = await prisma.contractSigning.create({
      data: {
        bookingReference,
        customerName,
        customerEmail: confirmEmail,
        contractHash,
        signedAt: new Date(agreedAt),
        idDocumentPath: `/contracts/${bookingReference}/${idFileName}`,
        passportDocumentPath: `/contracts/${bookingReference}/${passportFileName}`,
        signaturePath: `/contracts/${bookingReference}/signature.png`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'completed',
      },
    });

    // Update booking status to confirmed ONLY after successful contract signing
    await prisma.booking.update({
      where: { reference: bookingReference },
      data: {
        status: 'confirmed', // Now booking is confirmed
        depositPaid: false, // Will be set to true after payment
      },
    });

    // Generate contract HTML with signature
    const contractHTML = generateContractHTML({
      reference: bookingReference,
      customerName,
      customerPhone: booking.customer.phone,
      customerNationality: booking.customer.nationality || 'N/A',
      vehicleBrand: booking.vehicle.brand,
      vehicleModel: booking.vehicle.model,
      vehicleEngine: booking.vehicle.engine,
      vehiclePlateNumber: booking.fleetUnit?.licensePlate || 'TBD',
      pickupDate: booking.pickupDate.toISOString().split('T')[0],
      returnDate: booking.returnDate.toISOString().split('T')[0],
      days: Math.ceil(
        (booking.returnDate.getTime() - booking.pickupDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
      finalPrice: booking.finalPrice || booking.totalPrice,
      deposit: booking.depositRequired,
      signatureBase64: signatureBase64,
      signedDate: new Date().toISOString().split('T')[0],
    });

    // Send confirmation email with contract
    await sendSignedContractEmail({
      customerName,
      customerEmail: confirmEmail,
      bookingReference,
      vehicleModel: `${booking.vehicle.brand} ${booking.vehicle.model}`,
      vehiclePlateNumber: booking.fleetUnit?.licensePlate || 'TBD',
      pickupDate: booking.pickupDate.toISOString().split('T')[0],
      returnDate: booking.returnDate.toISOString().split('T')[0],
      contractHTML,
      finalPrice: booking.finalPrice || booking.totalPrice,
    }).catch((err) => console.error('Email notification failed:', err));

    return NextResponse.json({
      success: true,
      message: 'Contract signed successfully',
      contractId: contract.id,
      reference: bookingReference,
    });
  } catch (error: any) {
    console.error('Contract signing error:', error);
    return NextResponse.json(
      { error: 'Failed to sign contract', details: error.message },
      { status: 500 }
    );
  }
}

async function sendSignedContractEmail({
  customerName,
  customerEmail,
  bookingReference,
  vehicleModel,
  vehiclePlateNumber,
  pickupDate,
  returnDate,
  contractHTML,
  finalPrice,
}: {
  customerName: string;
  customerEmail: string;
  bookingReference: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  pickupDate: string;
  returnDate: string;
  contractHTML: string;
  finalPrice: number;
}) {
  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0066cc; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
    .header h1 { margin: 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .booking-summary { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: bold; }
    .detail-value { color: #0066cc; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .download-btn { display: inline-block; background: #0066cc; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin: 15px 0; }
    .important { background: #fff3cd; padding: 15px; border-left: 4px solid #0066cc; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏍️ Contract Signed!</h1>
      <p>Your rental agreement has been successfully signed and confirmed.</p>
    </div>

    <div class="content">
      <p>Dear <strong>${customerName}</strong>,</p>

      <p>Thank you for booking with KJM Motors! Your motorcycle rental agreement has been digitally signed and is now confirmed.</p>

      <div class="booking-summary">
        <h3 style="margin-top: 0; color: #0066cc;">Booking Summary</h3>
        <div class="detail-row">
          <span class="detail-label">Booking Reference:</span>
          <span class="detail-value"><strong>${bookingReference}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Vehicle:</span>
          <span class="detail-value">${vehicleModel}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">License Plate:</span>
          <span class="detail-value"><strong>${vehiclePlateNumber}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup:</span>
          <span class="detail-value">${pickupDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Return:</span>
          <span class="detail-value">${returnDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount:</span>
          <span class="detail-value"><strong>₱${finalPrice.toLocaleString('en-US')}</strong></span>
        </div>
      </div>

      <div class="important">
        <strong>📋 Important:</strong>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Bring your passport and valid ID on pickup day</li>
          <li>Keep this email for reference</li>
          <li>For any changes, contact us immediately</li>
          <li>Security deposit: ₱2,500</li>
        </ul>
      </div>

      <p><strong>Need help?</strong> Contact us on WhatsApp:<br>
      <a href="https://wa.me/639752984845" style="color: #22C55E; text-decoration: none;">+63 975 298 4845</a></p>

      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        <strong>Your signed contract is attached to this email.</strong><br>
        All your documents (ID, Passport, and Digital Signature) have been securely stored in our system.
      </p>
    </div>

    <div class="footer">
      <p><strong>KJM Motors</strong><br>
      Lo-Oc, Lapu-Lapu City, Cebu, Philippines<br>
      ☎️ +63 975 298 4845 | 📧 info@kjmmotors.com</p>
      <p style="color: #999;">This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
  `;

  console.log('📧 Sending signed contract email:', {
    to: customerEmail,
    subject: `Your Signed Rental Agreement - ${bookingReference}`,
    hasAttachment: true,
  });

  // TODO: Integration with Resend API
  // In production, implement with:
  //
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     from: 'contracts@kjmmotors.com',
  //     to: customerEmail,
  //     subject: `Your Signed Rental Agreement - ${bookingReference}`,
  //     html: emailHTML,
  //     attachments: [
  //       {
  //         filename: `KJM-Contract-${bookingReference}.pdf`,
  //         content: contractHTML, // Will be converted to PDF by Resend
  //         contentType: 'text/html',
  //       }
  //     ]
  //   })
  // });
}

function generateContractHTML({
  reference,
  customerName,
  customerPhone,
  customerNationality,
  vehicleBrand,
  vehicleModel,
  vehicleEngine,
  vehiclePlateNumber,
  pickupDate,
  returnDate,
  days,
  finalPrice,
  deposit,
  signatureBase64,
  signedDate,
}: {
  reference: string;
  customerName: string;
  customerPhone: string;
  customerNationality: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleEngine: string;
  vehiclePlateNumber: string;
  pickupDate: string;
  returnDate: string;
  days: number;
  finalPrice: number;
  deposit: number;
  signatureBase64: string;
  signedDate: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KJM Rental Agreement - ${reference}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0 0 5px 0;
            color: #0066cc;
        }
        .header p {
            margin: 5px 0;
            color: #666;
            font-size: 13px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #0066cc;
        }
        .details {
            margin-left: 20px;
        }
        .detail-row {
            margin-bottom: 8px;
            font-size: 14px;
        }
        .detail-label {
            font-weight: bold;
            display: inline-block;
            width: 180px;
        }
        .detail-value {
            display: inline-block;
            color: #0066cc;
        }
        .terms-list {
            margin-left: 20px;
            font-size: 13px;
        }
        .terms-list li {
            margin-bottom: 6px;
            line-height: 1.4;
        }
        .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
        }
        .signature-box {
            display: inline-block;
            border: 1px solid #999;
            padding: 10px;
            width: 250px;
            text-align: center;
            margin-right: 30px;
        }
        .signature-image {
            width: 100%;
            height: 80px;
            margin-bottom: 5px;
            border-bottom: 1px solid #999;
        }
        .signature-label {
            font-size: 12px;
            margin-top: 5px;
        }
        .document-info {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 5px;
            margin-top: 30px;
            font-size: 12px;
        }
        .document-info p {
            margin: 5px 0;
        }
        .agreement-text {
            background: #fffacd;
            padding: 15px;
            border-left: 4px solid #0066cc;
            margin: 20px 0;
            font-weight: bold;
            font-size: 14px;
        }
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏍️ MOTORCYCLE RENTAL AGREEMENT</h1>
        <p><strong>KJM MOTORCYCLE RENTAL</strong></p>
        <p>Lo-Oc, Lapu-Lapu City, Cebu, Philippines</p>
        <p style="margin-top: 10px; color: #0066cc;"><strong>Booking Reference: ${reference}</strong></p>
    </div>

    <div class="section">
        <h2>1. RENTER INFORMATION</h2>
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">Full Name:</span>
                <span class="detail-value">${customerName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Contact Number:</span>
                <span class="detail-value">${customerPhone}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Nationality:</span>
                <span class="detail-value">${customerNationality}</span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>2. VEHICLE INFORMATION</h2>
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">Brand & Model:</span>
                <span class="detail-value">${vehicleBrand} ${vehicleModel}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Engine Displacement:</span>
                <span class="detail-value">${vehicleEngine}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">License Plate:</span>
                <span class="detail-value"><strong>${vehiclePlateNumber}</strong></span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>3. RENTAL PERIOD</h2>
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">Pickup Date & Time:</span>
                <span class="detail-value">${pickupDate} at 9:00 AM</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Return Date & Time:</span>
                <span class="detail-value">${returnDate} at 5:00 PM</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total Duration:</span>
                <span class="detail-value">${days} day(s)</span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>4. PRICING & SECURITY DEPOSIT</h2>
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">Rental Amount:</span>
                <span class="detail-value">₱${finalPrice.toLocaleString('en-US')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Security Deposit:</span>
                <span class="detail-value">₱${deposit.toLocaleString('en-US')} (Refundable)</span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>5. RENTAL REQUIREMENTS</h2>
        <ul class="terms-list">
            <li>✓ Passport, Driver's License, and One (1) valid ID required</li>
            <li>✓ Valid Non-Professional Driver's License required (no student permits)</li>
            <li>✓ Only the authorized driver may operate the motorcycle</li>
            <li>✓ Must return with the same fuel level as upon release</li>
        </ul>
    </div>

    <div class="section">
        <h2>6. INSURANCE & TRAVEL POLICY</h2>
        <ul class="terms-list">
            <li>All motorcycles are covered with CTPL (Compulsory Third Party Liability) insurance</li>
            <li>CTPL covers third-party injuries or liabilities only</li>
            <li>Any damages to the rented motorcycle are the renter's responsibility</li>
            <li>Inter-island travel allowed with prior notification</li>
        </ul>
    </div>

    <div class="section">
        <h2>7. TERMS AND CONDITIONS</h2>
        <ul class="terms-list">
            <li>Late return: 15-minute grace period. Beyond this, extension fees apply</li>
            <li>Extension requests must be made 2 hours before return time</li>
            <li>Early returns are non-refundable</li>
            <li>Renter is liable for all damages, theft, or loss</li>
            <li>All traffic laws must be obeyed</li>
            <li><strong>NO ride-hailing or delivery services (Angkas, Move It, etc.)</strong></li>
            <li>No driving under influence of alcohol or drugs</li>
            <li>Violations result in immediate termination and penalties</li>
        </ul>
    </div>

    <div class="agreement-text">
        I have read, understood, and agreed to all the terms and conditions outlined above.
    </div>

    <div class="signature-section">
        <div style="display: inline-block; vertical-align: top;">
            <div class="signature-box">
                <div class="signature-image">
                    ${signatureBase64 ? `<img src="data:image/png;base64,${signatureBase64}" style="width: 100%; height: 100%; object-fit: contain;">` : '<span style="color: #999;">Signature</span>'}
                </div>
                <div class="signature-label">
                    <strong>Digital Signature</strong><br>
                    <span>${customerName}</span><br>
                    <span>Date: ${signedDate}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="document-info">
        <p><strong>Document Information:</strong></p>
        <p>Reference: <strong>${reference}</strong></p>
        <p>Signed: <strong>${signedDate}</strong></p>
        <p>Status: <strong style="color: #22C55E;">✓ SIGNED</strong></p>
    </div>
</body>
</html>
  `;
}
