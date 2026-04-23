import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../lib/db';

function isAuthed(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAuthed(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const vehicles = await prisma.vehicle.findMany({ orderBy: { dailyRate: 'asc' } });
  return NextResponse.json(vehicles);
}

export async function PATCH(request: NextRequest) {
  if (!isAuthed(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, dailyRate, weeklyRate, monthlyRate, visible, description } = body;

  if (!id) return NextResponse.json({ error: 'Vehicle id required' }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (dailyRate !== undefined) data.dailyRate = Number(dailyRate);
  if (weeklyRate !== undefined) data.weeklyRate = Number(weeklyRate);
  if (monthlyRate !== undefined) data.monthlyRate = Number(monthlyRate);
  if (visible !== undefined) data.visible = Boolean(visible);
  if (description !== undefined) data.description = description;

  const vehicle = await prisma.vehicle.update({ where: { id }, data });

  // Revalidate affected pages for live updates
  revalidatePath('/');
  revalidatePath('/scooters');
  revalidatePath('/booking');
  revalidatePath('/locations', 'layout');

  return NextResponse.json(vehicle);
}
