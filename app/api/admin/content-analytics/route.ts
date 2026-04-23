import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { subDays, subHours } from 'date-fns';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // 24h, 7d, 30d
    const contentType = searchParams.get('contentType'); // filter by type (article, guide, faq, scooter)

    let startDate: Date;

    if (timeRange === '24h') {
      startDate = subHours(new Date(), 24);
    } else if (timeRange === '30d') {
      startDate = subDays(new Date(), 30);
    } else {
      // default 7d
      startDate = subDays(new Date(), 7);
    }

    const endDate = new Date();

    // Fetch all page views
    const pageViews = await prisma.vehiclePageView.findMany({
      where: {
        viewedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Group by vehicle (treating as "articles" or "guides")
    const grouped: Record<string, any> = {};

    for (const view of pageViews) {
      if (!grouped[view.vehicleId]) {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: view.vehicleId },
          select: { brand: true, model: true, description: true },
        });

        grouped[view.vehicleId] = {
          vehicleId: view.vehicleId,
          title: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown',
          description: vehicle?.description || 'Scooter rental guide',
          views: 0,
          uniqueSessions: new Set<string>(),
          detailViews: 0,
          listingViews: 0,
          bounceRate: 0,
          lastViewed: new Date(0),
        };
      }

      grouped[view.vehicleId].views += 1;
      grouped[view.vehicleId].uniqueSessions.add(view.sessionId);
      grouped[view.vehicleId].lastViewed = new Date(
        Math.max(grouped[view.vehicleId].lastViewed.getTime(), view.viewedAt.getTime())
      );

      if (view.viewType === 'detail') {
        grouped[view.vehicleId].detailViews += 1;
      } else {
        grouped[view.vehicleId].listingViews += 1;
      }
    }

    // Calculate bounce rate (sessions with only listing views / total sessions)
    const data = Object.values(grouped)
      .map((item: any) => {
        const uniqueSessions = item.uniqueSessions.size;
        const sessionsList = Array.from(item.uniqueSessions);

        // Count sessions that only had listing views (no detail views)
        let bouncedSessions = 0;
        for (const sessionId of sessionsList) {
          const sessionViews = pageViews.filter(
            (v) => v.sessionId === sessionId && v.vehicleId === item.vehicleId
          );
          if (sessionViews.every((v) => v.viewType === 'listing')) {
            bouncedSessions += 1;
          }
        }

        return {
          vehicleId: item.vehicleId,
          title: item.title,
          description: item.description,
          views: item.views,
          uniqueSessions,
          detailViews: item.detailViews,
          listingViews: item.listingViews,
          bounceRate: uniqueSessions > 0 ? Math.round((bouncedSessions / uniqueSessions) * 100) : 0,
          lastViewed: item.lastViewed,
          conversionRate: uniqueSessions > 0 ? Math.round(((item.detailViews / uniqueSessions) / item.views) * 100) : 0,
          avgViewsPerSession: uniqueSessions > 0 ? Math.round((item.views / uniqueSessions) * 10) / 10 : 0,
        };
      })
      .sort((a, b) => b.views - a.views);

    // Calculate total stats
    const totalViews = pageViews.length;
    const totalUniqueSessions = new Set(pageViews.map((v) => v.sessionId)).size;
    const totalDetailViews = pageViews.filter((v) => v.viewType === 'detail').length;
    const totalListingViews = pageViews.filter((v) => v.viewType === 'listing').length;
    const topContent = data[0];
    const avgViewsPerSession = totalUniqueSessions > 0 ? (totalViews / totalUniqueSessions).toFixed(2) : '0';

    return NextResponse.json({
      timeRange,
      summary: {
        totalViews,
        totalUniqueSessions,
        totalDetailViews,
        totalListingViews,
        topContent: topContent ? topContent.title : 'N/A',
        avgViewsPerSession: parseFloat(avgViewsPerSession),
        engagementRate: totalUniqueSessions > 0
          ? Math.round((totalDetailViews / totalUniqueSessions) * 100)
          : 0,
      },
      data,
    });
  } catch (error: any) {
    console.error('Error fetching content analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content analytics', details: error.message },
      { status: 500 }
    );
  }
}
