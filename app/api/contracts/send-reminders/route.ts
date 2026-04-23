import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/**
 * POST /api/contracts/send-reminders
 * Sends reminder emails to customers who haven't signed contracts after 24 hours
 *
 * This should be called by a cron job (e.g., every 6 hours)
 * Example: Vercel Cron, AWS Lambda, or a scheduled task service
 */
export async function POST(request: NextRequest) {
  try {
    // Get bookings created more than 24 hours ago that don't have signed contracts
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pendingBookings = await prisma.booking.findMany({
      where: {
        status: 'pending', // Not yet confirmed
        createdAt: { lte: twentyFourHoursAgo }, // Created more than 24 hours ago
      },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    // Filter out bookings that already have signed contracts
    const remindersToSend = [];

    for (const booking of pendingBookings) {
      const contract = await prisma.contractSigning.findUnique({
        where: { bookingReference: booking.reference },
      });

      if (!contract) {
        // No contract signed yet - send reminder
        remindersToSend.push({
          bookingReference: booking.reference,
          customerName: booking.customer.firstName + ' ' + booking.customer.lastName,
          customerEmail: booking.customer.email,
          vehicleModel: `${booking.vehicle.brand} ${booking.vehicle.model}`,
          hoursWaiting: Math.floor(
            (Date.now() - booking.createdAt.getTime()) / (60 * 60 * 1000)
          ),
        });
      }
    }

    // Send reminder emails
    for (const reminder of remindersToSend) {
      await sendReminderEmail(reminder);
    }

    return NextResponse.json({
      success: true,
      reminders_sent: remindersToSend.length,
      details: remindersToSend,
    });
  } catch (error: any) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders', details: error.message },
      { status: 500 }
    );
  }
}

async function sendReminderEmail({
  bookingReference,
  customerName,
  customerEmail,
  vehicleModel,
  hoursWaiting,
}: {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  vehicleModel: string;
  hoursWaiting: number;
}): Promise<void> {
  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ff9800; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
    .header h1 { margin: 0; }
    .content { background: #fff9e6; padding: 20px; border: 2px solid #ff9800; border-top: none; }
    .action-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800; }
    .cta-button { display: inline-block; background: #0066cc; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Action Required: Sign Your Rental Agreement</h1>
    </div>

    <div class="content">
      <p>Dear <strong>${customerName}</strong>,</p>

      <p>We noticed that your rental agreement for booking <strong>${bookingReference}</strong> hasn't been signed yet.</p>

      <div class="action-box">
        <h3 style="margin-top: 0; color: #ff9800;">Your booking is awaiting signature</h3>
        <p><strong>Vehicle:</strong> ${vehicleModel}</p>
        <p><strong>Waiting time:</strong> ${hoursWaiting} hours</p>
        <p>To complete your booking and secure your vehicle, please sign the rental agreement immediately.</p>

        <p style="text-align: center;">
          <a href="https://kjmmotors.com/booking" class="cta-button">
            Sign Your Agreement Now
          </a>
        </p>
      </div>

      <h3>Why you need to sign?</h3>
      <ul>
        <li>✓ Confirms your booking</li>
        <li>✓ Secures your vehicle</li>
        <li>✓ Completes the rental process</li>
        <li>✓ Allows you to pick up on your scheduled date</li>
      </ul>

      <h3>What you'll need:</h3>
      <ul>
        <li>📄 Valid ID or Driver's License (upload)</li>
        <li>🛂 Passport copy (upload)</li>
        <li>✍️ Digital signature (draw on canvas)</li>
      </ul>

      <p><strong>Need help?</strong> Contact us on WhatsApp:<br>
      <a href="https://wa.me/639752984845" style="color: #22C55E; text-decoration: none;">+63 975 298 4845</a></p>

      <p style="color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <strong>⚠️ Important:</strong> Your booking may be automatically cancelled if not signed within 48 hours.
      </p>
    </div>

    <div class="footer">
      <p><strong>KJM Motors</strong><br>
      Lo-Oc, Lapu-Lapu City, Cebu, Philippines<br>
      ☎️ +63 975 298 4845</p>
      <p style="color: #999;">This is an automated reminder. Please reply via WhatsApp.</p>
    </div>
  </div>
</body>
</html>
  `;

  console.log('📧 Sending contract reminder email:', {
    to: customerEmail,
    subject: `⏰ Reminder: Sign Your Rental Agreement - ${bookingReference}`,
    type: 'reminder',
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
  //     from: 'reminders@kjmmotors.com',
  //     to: customerEmail,
  //     subject: `⏰ Reminder: Sign Your Rental Agreement - ${bookingReference}`,
  //     html: emailHTML,
  //   })
  // });
}
