// Simple email notification service (queued for manual sending)
import { prisma } from './db';

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  type: 'document-expiry' | 'damage-report' | 'booking-confirmation';
  fleetUnitId?: string;
  documentType?: string;
  daysUntilExpiry?: number;
}

/**
 * Queue an email notification for sending
 * In production, integrate with email service (Mailgun, SendGrid, etc.)
 */
export async function queueEmailNotification(notification: EmailNotification) {
  try {
    // Store notification in database for processing
    // This allows manual review before sending, or integration with background job
    const whatsappMessage = await prisma.whatsappMessage.create({
      data: {
        phone: notification.to, // Using phone field temporarily for email
        message: `[${notification.type.toUpperCase()}] ${notification.subject}\n\n${notification.body}`,
        status: 'pending',
        bookingId: notification.fleetUnitId,
      },
    });

    console.log(`Email queued: ${notification.to} - ${notification.subject}`);
    return whatsappMessage;
  } catch (err) {
    console.error('Error queueing email notification:', err);
    throw err;
  }
}

/**
 * Check all fleet units and send expiry alerts
 * Should be called daily via cron job
 */
export async function checkAndSendDocumentExpiryAlerts() {
  try {
    const now = new Date();
    const alerts = await prisma.documentExpiryAlert.findMany({
      where: {
        dismissed: false,
        daysUntilExpiry: {
          in: [0, 7, 3], // Send alerts at 3, 7, and 0 days
        },
      },
      include: {
        fleetUnit: {
          select: {
            id: true,
            unitNumber: true,
            licensePlate: true,
            vehicle: {
              select: { brand: true, model: true },
            },
          },
        },
      },
    });

    const emailsSent = [];

    for (const alert of alerts) {
      const unit = alert.fleetUnit;
      const subject = `[ALERT] Document Expiry: ${unit.unitNumber} - ${alert.documentType}`;

      let urgencyLevel = 'WARNING';
      let daysText = `${alert.daysUntilExpiry} days`;

      if (alert.daysUntilExpiry === 0) {
        urgencyLevel = 'CRITICAL';
        daysText = 'TODAY';
      } else if (alert.daysUntilExpiry < 0) {
        urgencyLevel = 'EXPIRED';
        daysText = `${Math.abs(alert.daysUntilExpiry)} days ago`;
      }

      const body = `
Document Type: ${alert.documentType}
Fleet Unit: ${unit.unitNumber} (${unit.licensePlate})
Vehicle: ${unit.vehicle.brand} ${unit.vehicle.model}
Expiry Status: ${urgencyLevel} - ${daysText}
Expiry Date: ${new Date(alert.expiryDate).toLocaleDateString()}

ACTION REQUIRED: Please renew the ${alert.documentType} document for unit ${unit.unitNumber} before it expires.

Dashboard Link: https://kjm-motors.com/admin/dashboard
      `.trim();

      try {
        const email = await queueEmailNotification({
          to: process.env.ADMIN_EMAIL || 'admin@kjm-motors.com',
          subject,
          body,
          type: 'document-expiry',
          fleetUnitId: unit.id,
          documentType: alert.documentType,
          daysUntilExpiry: alert.daysUntilExpiry,
        });

        // Update alert to mark that notification was sent
        await prisma.documentExpiryAlert.update({
          where: { id: alert.id },
          data: {
            firstAlertSent: alert.firstAlertSent || new Date(),
            alertCount: (alert.alertCount || 0) + 1,
          },
        });

        emailsSent.push({
          alertId: alert.id,
          unitNumber: unit.unitNumber,
          documentType: alert.documentType,
          daysUntilExpiry: alert.daysUntilExpiry,
        });
      } catch (err) {
        console.error(`Failed to queue email for alert ${alert.id}:`, err);
      }
    }

    return {
      success: true,
      emailsSent,
      message: `Checked document expiry alerts. Sent ${emailsSent.length} email(s).`,
    };
  } catch (err) {
    console.error('Error checking document expiry alerts:', err);
    throw err;
  }
}

/**
 * Send damage report notification
 */
export async function sendDamageReportNotification(
  fleetUnitId: string,
  description: string,
  severity: string,
  location: string
) {
  try {
    const unit = await prisma.fleetUnit.findUnique({
      where: { id: fleetUnitId },
      include: { vehicle: { select: { brand: true, model: true } } },
    });

    if (!unit) {
      throw new Error('Fleet unit not found');
    }

    const subject = `[DAMAGE] Report: ${unit.unitNumber} - ${severity.toUpperCase()}`;
    const body = `
New damage report for fleet unit:

Unit: ${unit.unitNumber} (${unit.licensePlate})
Vehicle: ${unit.vehicle.brand} ${unit.vehicle.model}
Severity: ${severity.toUpperCase()}
Location: ${location}
Description: ${description}

Please review the damage history in the dashboard and schedule repairs if needed.
Dashboard Link: https://kjm-motors.com/admin/dashboard
    `.trim();

    return await queueEmailNotification({
      to: process.env.ADMIN_EMAIL || 'admin@kjm-motors.com',
      subject,
      body,
      type: 'damage-report',
      fleetUnitId,
    });
  } catch (err) {
    console.error('Error sending damage report notification:', err);
    throw err;
  }
}
