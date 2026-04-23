import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../../lib/db';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

// PATCH update damage log
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const {
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

    const updateData: any = {};

    if (description !== undefined) updateData.description = description;
    if (severity !== undefined) updateData.severity = severity;
    if (damageType !== undefined) updateData.damageType = damageType;
    if (location !== undefined) updateData.location = location;
    if (photoUrls !== undefined) {
      updateData.photoUrls = Array.isArray(photoUrls)
        ? JSON.stringify(photoUrls)
        : photoUrls;
    }
    if (videoUrls !== undefined) {
      updateData.videoUrls = Array.isArray(videoUrls)
        ? JSON.stringify(videoUrls)
        : videoUrls;
    }
    if (inspectedDate !== undefined)
      updateData.inspectedDate = inspectedDate ? new Date(inspectedDate) : null;
    if (repairDate !== undefined)
      updateData.repairDate = repairDate ? new Date(repairDate) : null;
    if (repairCost !== undefined)
      updateData.repairCost = repairCost ? parseInt(repairCost) : null;
    if (repairNotes !== undefined) updateData.repairNotes = repairNotes;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const damageLog = await prisma.damageLog.update({
      where: { id },
      data: updateData,
      include: {
        fleetUnit: {
          select: { unitNumber: true, licensePlate: true },
        },
      },
    });

    revalidatePath('/admin/dashboard');

    return NextResponse.json({ damageLog });
  } catch (err: any) {
    console.error('Error updating damage log:', err);
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Damage log not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update damage log' }, { status: 500 });
  }
}

// DELETE damage log
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.damageLog.delete({
      where: { id },
    });

    revalidatePath('/admin/dashboard');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting damage log:', err);
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Damage log not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete damage log' }, { status: 500 });
  }
}
