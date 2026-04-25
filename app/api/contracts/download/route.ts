import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { readFile } from 'fs/promises';
import path from 'path';

const MAX_SIGNATURE_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * GET /api/contracts/download?reference=KJM-xxx
 * Download signed contract as HTML or PDF-ready format
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');
  const format = searchParams.get('format') || 'html'; // html or pdf

  if (!reference) {
    return NextResponse.json({ error: 'reference required' }, { status: 400 });
  }

  // Validate reference format (basic alphanumeric check)
  if (!/^KJM-\d{8}-\d{6}$/.test(reference)) {
    return NextResponse.json({ error: 'Invalid reference format' }, { status: 400 });
  }

  // Validate format parameter
  if (!['html', 'pdf'].includes(format)) {
    return NextResponse.json({ error: 'Invalid format parameter' }, { status: 400 });
  }

  try {
    // Get contract signing record
    const contract = await prisma.contractSigning.findUnique({
      where: { bookingReference: reference },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Get booking details for full contract
    const booking = await prisma.booking.findUnique({
      where: { reference },
      include: {
        vehicle: true,
        customer: true,
        fleetUnit: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Calculate days
    const days = Math.ceil(
      (booking.returnDate.getTime() - booking.pickupDate.getTime()) / 86400000
    );

    // Read signature image and convert to base64
    let signatureBase64 = '';
    try {
      const signaturePath = path.join(
        process.cwd(),
        'public',
        contract.signaturePath
      );

      // Validate path doesn't escape public directory (path traversal protection)
      const resolvedPath = path.resolve(signaturePath);
      const publicPath = path.resolve(process.cwd(), 'public');
      if (!resolvedPath.startsWith(publicPath)) {
        throw new Error('Invalid signature path');
      }

      const signatureBuffer = await readFile(signaturePath);

      // Check file size
      if (signatureBuffer.length > MAX_SIGNATURE_FILE_SIZE) {
        console.error(`Signature file too large: ${signatureBuffer.length} bytes`);
      } else {
        signatureBase64 = signatureBuffer.toString('base64');
      }
    } catch (err) {
      console.error('Error reading signature:', err);
      // Continue without signature rather than failing the whole request
    }

    // Generate HTML contract with signature
    const htmlContract = generateContractHTML({
      reference,
      customerName: booking.customer.firstName + ' ' + booking.customer.lastName,
      customerPhone: booking.customer.phone,
      customerNationality: booking.customer.nationality || 'N/A',
      vehicleBrand: booking.vehicle.brand,
      vehicleModel: booking.vehicle.model,
      vehicleEngine: booking.vehicle.engine,
      vehiclePlateNumber: booking.fleetUnit?.licensePlate || 'TBD',
      pickupDate: booking.pickupDate.toISOString().split('T')[0],
      returnDate: booking.returnDate.toISOString().split('T')[0],
      days,
      finalPrice: booking.finalPrice || booking.totalPrice,
      deposit: booking.depositRequired,
      signatureBase64,
      signedDate: contract.signedAt.toISOString().split('T')[0],
    });

    if (format === 'pdf') {
      // For PDF, return HTML that can be printed/saved as PDF
      return new NextResponse(htmlContract, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="KJM-Contract-${reference}.html"`,
        },
      });
    }

    // Return HTML for viewing
    return new NextResponse(htmlContract, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error downloading contract:', error);
    return NextResponse.json(
      { error: 'Failed to download contract', details: error.message },
      { status: 500 }
    );
  }
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
            body {
                padding: 0;
            }
            .no-print {
                display: none;
            }
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
                <span class="detail-label">Plate Number:</span>
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
            <li>Any damages to the rented motorcycle or personal injuries are NOT covered and will be the renter's responsibility</li>
            <li>Inter-island travel allowed with prior notification</li>
        </ul>
    </div>

    <div class="section">
        <h2>7. TERMS AND CONDITIONS</h2>
        <ul class="terms-list">
            <li>Late return: 15-minute grace period allowed. Beyond this, a 1-hour extension fee will apply (₱100-200)</li>
            <li>Rental extension requests must be made at least 2 hours before the agreed return time</li>
            <li>No refund policy - Early return does not qualify for any refund</li>
            <li>No half-day rentals during weekends</li>
            <li>Unlimited kilometers allowed within Cebu Province (restrictions apply outside)</li>
            <li>Renter liable for all repair or replacement costs in case of accident, theft, loss, or damage</li>
            <li>Renter must comply with all traffic laws and regulations</li>
            <li>Motorcycle must be returned in the same condition as received (except normal wear and tear)</li>
            <li>Driving under the influence of alcohol or illegal drugs is strictly prohibited</li>
            <li><strong>PROHIBITED USE: The rented motorcycle must NOT be used for ride-hailing or delivery services (Angkas, Move It, Maxim, habal-habal, etc.)</strong></li>
            <li>Any violation may result in immediate termination of the rental agreement and corresponding penalties</li>
        </ul>
    </div>

    <div class="agreement-text">
        I have read, understood, and agreed to all the terms and conditions outlined above. I acknowledge full responsibility for the rented motorcycle and accept all liability for damages, fines, or violations that may occur during the rental period.
    </div>

    <div class="signature-section">
        <div style="display: inline-block; vertical-align: top;">
            <div class="signature-box">
                <div class="signature-image">
                    ${signatureBase64 ? `<img src="data:image/png;base64,${signatureBase64}" style="width: 100%; height: 100%; object-fit: contain;">` : '<span style="color: #999;">No signature</span>'}
                </div>
                <div class="signature-label">
                    <strong>Renter Signature</strong><br>
                    <span>${customerName}</span><br>
                    <span>Date: ${signedDate}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="document-info">
        <p><strong>Document Information:</strong></p>
        <p>Reference Number: <strong>${reference}</strong></p>
        <p>Signed Date: <strong>${signedDate}</strong></p>
        <p>Status: <strong style="color: #22C55E;">✓ SIGNED</strong></p>
        <p style="margin-top: 10px; font-size: 11px; color: #666;">This is a digitally signed contract. All documents (ID, Passport, and Signature) have been securely stored.</p>
    </div>
</body>
</html>
  `;
}
