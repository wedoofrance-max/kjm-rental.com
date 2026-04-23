import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const bookings = await prisma.booking.findMany({
    where: status ? { status } : undefined,
    include: {
      vehicle: { select: { brand: true, model: true, engine: true } },
      customer: { select: { firstName: true, lastName: true, email: true, phone: true, nationality: true } },
      payment: { select: { method: true, status: true } },
      fleetUnit: { select: { id: true, unitNumber: true, licensePlate: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(bookings);
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await request.json();
  const validStatuses = ['pending', 'confirmed', 'active', 'returned', 'cancelled'];
  if (!validStatuses.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const booking = await prisma.booking.update({
    where: { id },
    data: { status },
    include: {
      vehicle: { select: { brand: true, model: true } },
      customer: { select: { firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(booking);
}
