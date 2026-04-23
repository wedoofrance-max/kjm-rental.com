import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../../lib/db';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

// PATCH update fleet unit (maintenance tracking, kilometers, etc)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { vehicleId, unitNumber, status, currentKilometers, lastMaintenanceDate, maintenanceKilometers, licensePlate, orCrExpiry, ltRegistrationExpiry, insuranceExpiry } = await req.json();

    const updateData: any = {};

    // Validate and update vehicleId
    if (vehicleId !== undefined) {
      const vehicleExists = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicleExists) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 400 });
      }
      updateData.vehicleId = vehicleId;
    }

    if (unitNumber !== undefined) updateData.unitNumber = unitNumber;
    if (status !== undefined) updateData.status = status;
    if (currentKilometers !== undefined) updateData.currentKilometers = parseInt(currentKilometers);
    if (lastMaintenanceDate !== undefined) updateData.lastMaintenanceDate = lastMaintenanceDate ? new Date(lastMaintenanceDate) : null;
    if (maintenanceKilometers !== undefined) updateData.maintenanceKilometers = maintenanceKilometers ? parseInt(maintenanceKilometers) : null;
    if (licensePlate !== undefined) updateData.licensePlate = licensePlate;
    if (orCrExpiry !== undefined) updateData.orCrExpiry = orCrExpiry ? new Date(orCrExpiry) : null;
    if (ltRegistrationExpiry !== undefined) updateData.ltRegistrationExpiry = ltRegistrationExpiry ? new Date(ltRegistrationExpiry) : null;
    if (insuranceExpiry !== undefined) updateData.insuranceExpiry = insuranceExpiry ? new Date(insuranceExpiry) : null;

    // If setting to maintenance, block availability
    if (status === 'maintenance') {
      const unit = await prisma.fleetUnit.findUnique({ where: { id }, select: { vehicleId: true } });
      if (unit) {
        // Block all future dates for maintenance
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Block 30 days ahead for maintenance
        for (let i = 0; i < 30; i++) {
          const blockDate = new Date(today);
          blockDate.setDate(blockDate.getDate() + i);

          await prisma.availability.upsert({
            where: {
              vehicleId_date: {
                vehicleId: unit.vehicleId,
                date: blockDate,
              },
            },
            create: {
              vehicleId: unit.vehicleId,
              date: blockDate,
              available: false,
              reason: 'Maintenance',
            },
            update: {
              available: false,
              reason: 'Maintenance',
            },
          });
        }
      }
    }

    const fleetUnit = await prisma.fleetUnit.update({
      where: { id },
      data: updateData,
      include: {
        vehicle: {
          select: { brand: true, model: true },
        },
      },
    });

    // Revalidate affected pages for live updates
    revalidatePath('/');
    revalidatePath('/scooters');
    revalidatePath('/booking');
    revalidatePath('/api/availability');

    return NextResponse.json({ fleetUnit });
  } catch (err: any) {
    console.error('Error updating fleet unit:', err);
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Fleet unit not found' }, { status: 404 });
    }
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'License plate already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update fleet unit' }, { status: 500 });
  }
}

// DELETE fleet unit
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.fleetUnit.delete({
      where: { id },
    });

    // Revalidate affected pages for live updates
    revalidatePath('/');
    revalidatePath('/scooters');
    revalidatePath('/booking');
    revalidatePath('/api/availability');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting fleet unit:', err);
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Fleet unit not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete fleet unit' }, { status: 500 });
  }
}
