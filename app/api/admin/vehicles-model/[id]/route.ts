import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../../lib/db';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

// PATCH update vehicle model
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { brand, model, engine, type, dailyRate, weeklyRate, monthlyRate, topCase, description, visible } = await req.json();

    const updateData: any = {};
    if (brand !== undefined) updateData.brand = brand;
    if (model !== undefined) updateData.model = model;
    if (engine !== undefined) updateData.engine = engine;
    if (type !== undefined) updateData.type = type;
    if (dailyRate !== undefined) updateData.dailyRate = parseInt(dailyRate);
    if (weeklyRate !== undefined) updateData.weeklyRate = parseInt(weeklyRate);
    if (monthlyRate !== undefined) updateData.monthlyRate = parseInt(monthlyRate);
    if (topCase !== undefined) updateData.topCase = Boolean(topCase);
    if (description !== undefined) updateData.description = description;
    if (visible !== undefined) updateData.visible = Boolean(visible);

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: {
        fleetUnits: {
          select: { id: true, unitNumber: true, licensePlate: true, status: true, currentKilometers: true, lastMaintenanceDate: true },
        },
      },
    });

    // Revalidate affected pages for live updates
    revalidatePath('/');
    revalidatePath('/scooters');
    revalidatePath('/booking');

    return NextResponse.json({ vehicle });
  } catch (err: any) {
    console.error('Error updating vehicle:', err);
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

// DELETE vehicle model (and all its fleet units)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Delete will cascade to fleetUnits
    await prisma.vehicle.delete({
      where: { id },
    });

    // Revalidate affected pages for live updates
    revalidatePath('/');
    revalidatePath('/scooters');
    revalidatePath('/booking');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting vehicle:', err);
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}
