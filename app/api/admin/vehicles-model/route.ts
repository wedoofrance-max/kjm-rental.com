import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../lib/db';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

// GET all vehicle models
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        fleetUnits: {
          select: {
            id: true,
            vehicleId: true,
            unitNumber: true,
            licensePlate: true,
            status: true,
            currentKilometers: true,
            lastMaintenanceDate: true,
            maintenanceKilometers: true,
            orCrDocumentUrl: true,
            orCrExpiry: true,
            ltRegistrationExpiry: true,
            insuranceExpiry: true,
          },
        },
      },
    });

    return NextResponse.json({ vehicles });
  } catch (err) {
    console.error('Error fetching vehicles:', err);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

// POST new vehicle model
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { brand, model, engine, type, dailyRate, weeklyRate, monthlyRate, topCase, description } = await req.json();

    if (!brand || !model || !engine || !type || !dailyRate || !weeklyRate || !monthlyRate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        brand,
        model,
        engine,
        type,
        dailyRate: parseInt(dailyRate),
        weeklyRate: parseInt(weeklyRate),
        monthlyRate: parseInt(monthlyRate),
        topCase: Boolean(topCase),
        description: description || null,
        visible: true,
      },
    });

    // Revalidate affected pages for live updates
    revalidatePath('/');
    revalidatePath('/scooters');
    revalidatePath('/booking');

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (err) {
    console.error('Error creating vehicle:', err);
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}
