import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { queueEmailNotification } from '@/lib/email-service';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

// Constants
const MAINTENANCE_INTERVAL_DAYS = 45;
const MAINTENANCE_INTERVAL_KM = 5000;
const REMINDER_DAYS_BEFORE = 3;
const ADMIN_EMAIL = 'kirstinemaranga@gmail.com';

function calculateNextMaintenanceDate(lastMaintenanceDate: Date, currentKm: number): Date {
  // Based on date: 45 days
  const dateBasedDate = new Date(lastMaintenanceDate);
  dateBasedDate.setDate(dateBasedDate.getDate() + MAINTENANCE_INTERVAL_DAYS);

  // Note: We don't have km consumption rate in DB, so we use date-based only
  // In real implementation, you could track km/day and calculate both
  return dateBasedDate;
}

// GET: Check and send pending maintenance reminders
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all fleet units with their vehicle info
    const fleetUnits = await prisma.fleetUnit.findMany({
      include: {
        vehicle: {
          select: { brand: true, model: true, engine: true },
        },
      },
    });

    const remindersToSend = [];

    for (const unit of fleetUnits) {
      if (!unit.lastMaintenanceDate) continue;

      const nextMaintenanceDate = calculateNextMaintenanceDate(unit.lastMaintenanceDate, unit.currentKilometers);
      const reminderDate = new Date(nextMaintenanceDate);
      reminderDate.setDate(reminderDate.getDate() - REMINDER_DAYS_BEFORE);

      // Check if today is the reminder date and haven't sent yet
      if (today >= reminderDate && today < nextMaintenanceDate) {
        // Check if reminder was already sent (to avoid duplicates)
        if (!unit.lastMaintenanceDate || !unit.id.includes('reminder-sent')) {
          remindersToSend.push({
            unitNumber: unit.unitNumber,
            licensePlate: unit.licensePlate,
            brand: unit.vehicle.brand,
            model: unit.vehicle.model,
            engine: unit.vehicle.engine,
            lastMaintenanceDate: unit.lastMaintenanceDate,
            currentKm: unit.currentKilometers,
            nextMaintenanceDate,
            unitId: unit.id,
          });
        }
      }
    }

    // Send emails for all pending reminders
    const sentReminders = [];
    for (const reminder of remindersToSend) {
      try {
        const emailContent = `
          <h2>🔧 Rappel de Maintenance - KJM Motors</h2>
          <p><strong>${reminder.brand} ${reminder.model}</strong> (${reminder.engine})</p>
          <p><strong>Unit:</strong> ${reminder.unitNumber} (${reminder.licensePlate})</p>
          <p><strong>Dernière maintenance:</strong> ${reminder.lastMaintenanceDate.toLocaleDateString('fr-FR')} à ${reminder.currentKm} km</p>
          <p><strong>Prochaine maintenance due:</strong> ${reminder.nextMaintenanceDate.toLocaleDateString('fr-FR')}</p>
          <p style="color: #f97316; font-weight: bold;">[ACTION] Maintenance requise dans 3 jours!</p>
          <p>Veuillez planifier l'entretien pour cette unité.</p>
        `;

        await queueEmailNotification({
          to: ADMIN_EMAIL,
          subject: `[KJM] Maintenance requise - ${reminder.unitNumber}`,
          body: emailContent,
          type: 'damage-report', // Using existing type, could extend interface
        });

        sentReminders.push(reminder.unitNumber);
      } catch (err) {
        console.error(`Failed to send email for ${reminder.unitNumber}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      totalChecked: fleetUnits.length,
      remindersSent: sentReminders.length,
      reminders: sentReminders,
    });
  } catch (err: any) {
    console.error('Error checking maintenance reminders:', err);
    return NextResponse.json({ error: 'Failed to check reminders' }, { status: 500 });
  }
}
