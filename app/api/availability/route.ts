import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get('vehicleId');
  const pickupDate = searchParams.get('pickupDate');
  const returnDate = searchParams.get('returnDate');

  if (!vehicleId || !pickupDate || !returnDate) {
    return NextResponse.json({ error: 'vehicleId, pickupDate, returnDate required' }, { status: 400 });
  }

  try {
    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    // Check if vehicle is visible
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { visible: true } });
    if (!vehicle?.visible) {
      return NextResponse.json({ available: false, totalUnits: 0, booked: 0, reason: 'not_available' });
    }

    // Check manually blocked dates
    const blockedCount = await prisma.availability.count({
      where: {
        vehicleId,
        available: false,
        date: { gte: start, lte: end },
      },
    });
    if (blockedCount > 0) {
      return NextResponse.json({ available: false, totalUnits: 0, booked: 0, reason: 'maintenance' });
    }

    const totalUnits = await prisma.fleetUnit.count({
      where: { vehicleId, status: 'available' },
    });

    const overlapping = await prisma.booking.count({
      where: {
        vehicleId,
        status: { in: ['pending', 'confirmed', 'active'] },
        AND: [
          { pickupDate: { lte: end } },
          { returnDate: { gte: start } },
        ],
      },
    });

    const available = overlapping < totalUnits;
    return NextResponse.json({ available, totalUnits, booked: overlapping });
  } catch {
    return NextResponse.json({ error: 'Availability check failed' }, { status: 500 });
  }
}
