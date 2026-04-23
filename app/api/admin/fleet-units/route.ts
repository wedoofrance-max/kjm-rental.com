import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../lib/db';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

// GET all fleet units (with vehicle info)
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const vehicleId = req.nextUrl.searchParams.get('vehicleId');

    const where = vehicleId ? { vehicleId } : {};

    const fleetUnits = await prisma.fleetUnit.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, brand: true, model: true },
        },
      },
      orderBy: [{ vehicleId: 'asc' }, { unitNumber: 'asc' }],
    });

    return NextResponse.json({ fleetUnits });
  } catch (err) {
    console.error('Error fetching fleet units:', err);
    return NextResponse.json({ error: 'Failed to fetch fleet units' }, { status: 500 });
  }
}

// POST create new fleet unit
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { vehicleId, unitNumber, licensePlate, maintenanceKilometers, lastMaintenanceDate, orCrExpiry, ltRegistrationExpiry, insuranceExpiry } = await req.json();

    if (!vehicleId || !unitNumber || !licensePlate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fleetUnit = await prisma.fleetUnit.create({
      data: {
        vehicleId,
        unitNumber,
        licensePlate,
        status: 'available',
        currentKilometers: 0,
        maintenanceKilometers: maintenanceKilometers ? parseInt(maintenanceKilometers) : null,
        lastMaintenanceDate: lastMaintenanceDate ? new Date(lastMaintenanceDate) : null,
        orCrExpiry: orCrExpiry ? new Date(orCrExpiry) : null,
        ltRegistrationExpiry: ltRegistrationExpiry ? new Date(ltRegistrationExpiry) : null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
      },
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

    return NextResponse.json({ fleetUnit }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating fleet unit:', err);
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'License plate already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create fleet unit' }, { status: 500 });
  }
}
