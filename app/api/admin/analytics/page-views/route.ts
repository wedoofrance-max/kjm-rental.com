import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

// GET page view analytics for dashboard
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const timeRange = req.nextUrl.searchParams.get('timeRange') || '7d';
    const vehicleId = req.nextUrl.searchParams.get('vehicleId');

    // Calculate date range
    const now = new Date();
    let fromDate = new Date();

    if (timeRange === '30d') {
      fromDate.setDate(fromDate.getDate() - 30);
    } else if (timeRange === '24h') {
      fromDate.setHours(fromDate.getHours() - 24);
    } else {
      // Default to 7d
      fromDate.setDate(fromDate.getDate() - 7);
    }

    const where = {
      viewedAt: {
        gte: fromDate,
        lte: now,
      },
      ...(vehicleId && { vehicleId }),
    };

    // Get all page views in time range
    const pageViews = await prisma.vehiclePageView.findMany({
      where,
      orderBy: { viewedAt: 'asc' },
    });

    // Group views by date
    const viewsByDate = new Map<string, { listing: number; detail: number }>();

    for (const view of pageViews) {
      const dateKey = view.viewedAt.toISOString().split('T')[0];
      if (!viewsByDate.has(dateKey)) {
        viewsByDate.set(dateKey, { listing: 0, detail: 0 });
      }
      const counts = viewsByDate.get(dateKey)!;
      if (view.viewType === 'listing') {
        counts.listing++;
      } else {
        counts.detail++;
      }
    }

    // Convert to array format for charting
    const chartData = Array.from(viewsByDate.entries()).map(([date, counts]) => ({
      date,
      listing: counts.listing,
      detail: counts.detail,
      total: counts.listing + counts.detail,
    }));

    // Calculate totals
    const totalViews = pageViews.length;
    const listingViews = pageViews.filter((v) => v.viewType === 'listing').length;
    const detailViews = pageViews.filter((v) => v.viewType === 'detail').length;

    // Get top vehicles by views
    const topVehicles = vehicleId
      ? []
      : (function () {
          const vehicleMap = new Map<string, number>();
          for (const view of pageViews) {
            vehicleMap.set(
              view.vehicleId,
              (vehicleMap.get(view.vehicleId) || 0) + 1
            );
          }
          return Array.from(vehicleMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([vid, count]) => ({ vehicleId: vid, viewCount: count }));
        })();

    // Calculate daily average
    const dayCount = Math.max(
      Math.ceil(
        (now.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
      1
    );
    const dailyAverage = Math.round(totalViews / dayCount);

    return NextResponse.json({
      success: true,
      timeRange,
      period: {
        from: fromDate.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0],
      },
      summary: {
        totalViews,
        listingViews,
        detailViews,
        dailyAverage,
      },
      chartData,
      topVehicles,
      timestamp: now,
    });
  } catch (err: any) {
    console.error('Error fetching page view analytics:', err);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: err.message },
      { status: 500 }
    );
  }
}
