import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../lib/db';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

// GET all damage logs (with optional filter by fleetUnitId)
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const fleetUnitId = req.nextUrl.searchParams.get('fleetUnitId');
    const where = fleetUnitId ? { fleetUnitId } : {};

    const damageLogs = await prisma.damageLog.findMany({
      where,
      include: {
        fleetUnit: {
          select: { id: true, unitNumber: true, licensePlate: true, vehicleId: true },
        },
      },
      orderBy: { reportedDate: 'desc' },
    });

    return NextResponse.json({ damageLogs });
  } catch (err) {
    console.error('Error fetching damage logs:', err);
    return NextResponse.json({ error: 'Failed to fetch damage logs' }, { status: 500 });
  }
}

// POST create new damage log
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      fleetUnitId,
      description,
      severity,
      damageType,
      location,
      photoUrls,
      videoUrls,
      inspectedDate,
      repairDate,
      repairCost,
      repairNotes,
      status,
      notes,
    } = await req.json();

    if (!fleetUnitId || !description || !severity || !damageType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify fleet unit exists
    const fleetUnitExists = await prisma.fleetUnit.findUnique({
      where: { id: fleetUnitId },
    });
    if (!fleetUnitExists) {
      return NextResponse.json({ error: 'Fleet unit not found' }, { status: 404 });
    }

    // Convert photoUrls array to JSON string if it's an array
    const photoUrlsString = Array.isArray(photoUrls)
      ? JSON.stringify(photoUrls)
      : photoUrls || JSON.stringify([]);

    // Convert videoUrls array to JSON string if it's an array
    const videoUrlsString = Array.isArray(videoUrls)
      ? JSON.stringify(videoUrls)
      : videoUrls || JSON.stringify([]);

    const damageLog = await prisma.damageLog.create({
      data: {
        fleetUnitId,
        description,
        severity,
        damageType,
        location,
        photoUrls: photoUrlsString,
        videoUrls: videoUrlsString,
        inspectedDate: inspectedDate ? new Date(inspectedDate) : null,
        repairDate: repairDate ? new Date(repairDate) : null,
        repairCost: repairCost ? parseInt(repairCost) : null,
        repairNotes: repairNotes || null,
        status: status || 'reported',
        notes: notes || null,
      },
      include: {
        fleetUnit: {
          select: { unitNumber: true, licensePlate: true },
        },
      },
    });

    revalidatePath('/admin/dashboard');

    return NextResponse.json({ damageLog }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating damage log:', err);
    return NextResponse.json({ error: 'Failed to create damage log' }, { status: 500 });
  }
}
