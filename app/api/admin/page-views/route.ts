import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// POST track a page view
export async function POST(req: NextRequest) {
  try {
    const { vehicleId, sessionId, viewType, ipHash, referrer } = await req.json();

    if (!vehicleId || !sessionId || !viewType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log the page view
    await prisma.vehiclePageView.create({
      data: {
        vehicleId,
        sessionId,
        viewType,
        ipHash: ipHash || null,
        referrer: referrer || null,
      },
    });

    // Also update or create an active viewer record
    // Set expiry to 5 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await prisma.activeViewer.upsert({
      where: {
        // Use a composite key since we don't have a unique constraint
        // We'll use sessionId + vehicleId as unique identifier
        id: `${sessionId}-${vehicleId}-${viewType}`,
      },
      create: {
        vehicleId,
        sessionId,
        viewType,
        lastSeenAt: new Date(),
        expiresAt,
      },
      update: {
        lastSeenAt: new Date(),
        expiresAt,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Error tracking page view:', err);
    return NextResponse.json({ error: 'Failed to track page view' }, { status: 500 });
  }
}

// GET page view stats for a vehicle
export async function GET(req: NextRequest) {
  try {
    const vehicleId = req.nextUrl.searchParams.get('vehicleId');
    const timeRange = req.nextUrl.searchParams.get('timeRange') || '24h'; // 24h, 7d, 30d

    if (!vehicleId) {
      return NextResponse.json({ error: 'vehicleId required' }, { status: 400 });
    }

    // Calculate time range
    const now = new Date();
    let fromDate = new Date();

    if (timeRange === '7d') {
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (timeRange === '30d') {
      fromDate.setDate(fromDate.getDate() - 30);
    } else {
      // Default to 24h
      fromDate.setHours(fromDate.getHours() - 24);
    }

    // Get page views in time range
    const pageViews = await prisma.vehiclePageView.findMany({
      where: {
        vehicleId,
        viewedAt: {
          gte: fromDate,
          lte: now,
        },
      },
    });

    // Get active viewers (currently viewing)
    const activeViewers = await prisma.activeViewer.findMany({
      where: {
        vehicleId,
        expiresAt: {
          gt: now,
        },
      },
    });

    // Count by view type
    const listingViews = pageViews.filter((v) => v.viewType === 'listing').length;
    const detailViews = pageViews.filter((v) => v.viewType === 'detail').length;

    return NextResponse.json({
      vehicleId,
      timeRange,
      totalViews: pageViews.length,
      listingViews,
      detailViews,
      currentActiveViewers: activeViewers.length,
      activeViewersByType: {
        listing: activeViewers.filter((v) => v.viewType === 'listing').length,
        detail: activeViewers.filter((v) => v.viewType === 'detail').length,
      },
    });
  } catch (err) {
    console.error('Error fetching page view stats:', err);
    return NextResponse.json({ error: 'Failed to fetch page view stats' }, { status: 500 });
  }
}
