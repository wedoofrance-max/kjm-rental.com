import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

// GET all active document expiry alerts
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dismissed = req.nextUrl.searchParams.get('dismissed');
    const daysThreshold = parseInt(req.nextUrl.searchParams.get('daysThreshold') || '30');

    const where: any = {
      daysUntilExpiry: {
        lte: daysThreshold,
        gte: -30, // Include expired documents for last 30 days
      },
    };

    // Filter by dismissed status if specified
    if (dismissed !== null) {
      where.dismissed = dismissed === 'true';
    }

    const alerts = await prisma.documentExpiryAlert.findMany({
      where,
      include: {
        fleetUnit: {
          select: {
            id: true,
            unitNumber: true,
            licensePlate: true,
            vehicleId: true,
            vehicle: {
              select: { brand: true, model: true },
            },
          },
        },
      },
      orderBy: { daysUntilExpiry: 'asc' },
    });

    return NextResponse.json({ alerts });
  } catch (err) {
    console.error('Error fetching document alerts:', err);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

// POST to create/update document expiry alerts
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, alertIds } = await req.json();

    if (action === 'check') {
      // Check all fleet units for expiring documents
      const now = new Date();
      const allFleetUnits = await prisma.fleetUnit.findMany({
        select: {
          id: true,
          unitNumber: true,
          licensePlate: true,
          orCrExpiry: true,
          ltRegistrationExpiry: true,
          insuranceExpiry: true,
        },
      });

      const createdAlerts = [];

      for (const unit of allFleetUnits) {
        // Check OR/CR
        if (unit.orCrExpiry) {
          const daysUntil = Math.ceil(
            (new Date(unit.orCrExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntil <= 30) {
            const existing = await prisma.documentExpiryAlert.findUnique({
              where: {
                fleetUnitId_documentType: {
                  fleetUnitId: unit.id,
                  documentType: 'OR/CR',
                },
              },
            });

            if (!existing) {
              const alert = await prisma.documentExpiryAlert.create({
                data: {
                  fleetUnitId: unit.id,
                  documentType: 'OR/CR',
                  expiryDate: new Date(unit.orCrExpiry),
                  daysUntilExpiry: daysUntil,
                },
              });
              createdAlerts.push(alert);
            }
          }
        }

        // Check LTO
        if (unit.ltRegistrationExpiry) {
          const daysUntil = Math.ceil(
            (new Date(unit.ltRegistrationExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntil <= 30) {
            const existing = await prisma.documentExpiryAlert.findUnique({
              where: {
                fleetUnitId_documentType: {
                  fleetUnitId: unit.id,
                  documentType: 'LTO',
                },
              },
            });

            if (!existing) {
              const alert = await prisma.documentExpiryAlert.create({
                data: {
                  fleetUnitId: unit.id,
                  documentType: 'LTO',
                  expiryDate: new Date(unit.ltRegistrationExpiry),
                  daysUntilExpiry: daysUntil,
                },
              });
              createdAlerts.push(alert);
            }
          }
        }

        // Check Insurance
        if (unit.insuranceExpiry) {
          const daysUntil = Math.ceil(
            (new Date(unit.insuranceExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntil <= 30) {
            const existing = await prisma.documentExpiryAlert.findUnique({
              where: {
                fleetUnitId_documentType: {
                  fleetUnitId: unit.id,
                  documentType: 'Insurance',
                },
              },
            });

            if (!existing) {
              const alert = await prisma.documentExpiryAlert.create({
                data: {
                  fleetUnitId: unit.id,
                  documentType: 'Insurance',
                  expiryDate: new Date(unit.insuranceExpiry),
                  daysUntilExpiry: daysUntil,
                },
              });
              createdAlerts.push(alert);
            }
          }
        }
      }

      return NextResponse.json({
        message: 'Document alerts checked and updated',
        createdAlerts,
      });
    } else if (action === 'dismiss') {
      // Dismiss selected alerts
      if (!alertIds || alertIds.length === 0) {
        return NextResponse.json({ error: 'alertIds required for dismiss action' }, { status: 400 });
      }

      const updated = await prisma.documentExpiryAlert.updateMany({
        where: {
          id: { in: alertIds },
        },
        data: {
          dismissed: true,
        },
      });

      return NextResponse.json({
        message: 'Alerts dismissed',
        dismissedCount: updated.count,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Error managing document alerts:', err);
    return NextResponse.json({ error: 'Failed to manage alerts' }, { status: 500 });
  }
}
