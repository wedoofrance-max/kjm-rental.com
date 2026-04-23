import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

function isAuthed(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

// GET /api/admin/blocked-dates?vehicleId=xxx
export async function GET(request: NextRequest) {
  if (!isAuthed(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get('vehicleId');

  const where: Record<string, unknown> = { available: false };
  if (vehicleId) where.vehicleId = vehicleId;

  const blocked = await prisma.availability.findMany({
    where,
    orderBy: { date: 'asc' },
  });
  return NextResponse.json(blocked);
}

// POST /api/admin/blocked-dates — block a date range
export async function POST(request: NextRequest) {
  if (!isAuthed(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { vehicleId, startDate, endDate, reason } = await request.json();
  if (!vehicleId || !startDate || !endDate) {
    return NextResponse.json({ error: 'vehicleId, startDate, endDate required' }, { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  // Upsert each date as unavailable
  await Promise.all(
    dates.map((date) =>
      prisma.availability.upsert({
        where: { vehicleId_date: { vehicleId, date } },
        update: { available: false, reason: reason ?? 'maintenance' },
        create: { vehicleId, date, available: false, reason: reason ?? 'maintenance' },
      })
    )
  );

  return NextResponse.json({ blocked: dates.length });
}

// DELETE /api/admin/blocked-dates — unblock a date range
export async function DELETE(request: NextRequest) {
  if (!isAuthed(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { vehicleId, startDate, endDate } = await request.json();
  if (!vehicleId || !startDate || !endDate) {
    return NextResponse.json({ error: 'vehicleId, startDate, endDate required' }, { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const deleted = await prisma.availability.deleteMany({
    where: {
      vehicleId,
      date: { gte: start, lte: end },
      available: false,
    },
  });

  return NextResponse.json({ unblocked: deleted.count });
}
