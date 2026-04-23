import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

// GET current active viewers for all vehicles or a specific vehicle
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const vehicleId = req.nextUrl.searchParams.get('vehicleId');
    const now = new Date();

    const where = vehicleId
      ? {
          vehicleId,
          expiresAt: {
            gt: now,
          },
        }
      : {
          expiresAt: {
            gt: now,
          },
        };

    // Get active viewers
    const activeViewers = await prisma.activeViewer.findMany({
      where,
    });

    // Group by vehicle and view type
    const viewerStats = vehicleId
      ? {
          vehicleId,
          totalActive: activeViewers.length,
          byViewType: {
            listing: activeViewers.filter((v) => v.viewType === 'listing').length,
            detail: activeViewers.filter((v) => v.viewType === 'detail').length,
          },
          lastUpdated: new Date(),
        }
      : (function () {
          const stats: any = {};
          const vehicles = new Map();

          for (const viewer of activeViewers) {
            if (!vehicles.has(viewer.vehicleId)) {
              vehicles.set(viewer.vehicleId, {
                listing: 0,
                detail: 0,
              });
            }
            const counts = vehicles.get(viewer.vehicleId);
            if (viewer.viewType === 'listing') {
              counts.listing++;
            } else {
              counts.detail++;
            }
          }

          vehicles.forEach((counts, vid) => {
            stats[vid] = {
              totalActive: counts.listing + counts.detail,
              byViewType: counts,
            };
          });

          return stats;
        })();

    return NextResponse.json({
      success: true,
      data: viewerStats,
      timestamp: now,
    });
  } catch (err: any) {
    console.error('Error fetching viewer stats:', err);
    return NextResponse.json(
      { error: 'Failed to fetch viewer stats', details: err.message },
      { status: 500 }
    );
  }
}

// POST to track a new viewer (from public pages)
export async function POST(req: NextRequest) {
  try {
    const { vehicleId, sessionId, viewType } = await req.json();

    if (!vehicleId || !sessionId || !viewType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Set expiry to 5 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const viewer = await prisma.activeViewer.upsert({
      where: {
        id: `${sessionId}-${vehicleId}-${viewType}`,
      },
      create: {
        vehicleId,
        sessionId,
        viewType,
        expiresAt,
      },
      update: {
        lastSeenAt: new Date(),
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, viewer });
  } catch (err: any) {
    console.error('Error tracking viewer:', err);
    return NextResponse.json(
      { error: 'Failed to track viewer', details: err.message },
      { status: 500 }
    );
  }
}

// DELETE expired viewers (cleanup)
export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    const deleted = await prisma.activeViewer.deleteMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
      message: `Deleted ${deleted.count} expired viewer records`,
    });
  } catch (err: any) {
    console.error('Error deleting expired viewers:', err);
    return NextResponse.json(
      { error: 'Failed to delete expired viewers', details: err.message },
      { status: 500 }
    );
  }
}
