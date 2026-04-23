import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { subDays, subHours } from 'date-fns';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // 24h, 7d, 30d

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

    // Fetch all bookings in the time range
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Count by status
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      active: 0,
      returned: 0,
      cancelled: 0,
    };

    bookings.forEach((booking) => {
      if (booking.status in statusCounts) {
        statusCounts[booking.status as keyof typeof statusCounts] += 1;
      }
    });

    const totalBookings = bookings.length;
    const confirmedBookings = statusCounts.confirmed + statusCounts.active + statusCounts.returned;
    const conversionRate = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0;
    const cancellationRate = totalBookings > 0 ? Math.round((statusCounts.cancelled / totalBookings) * 100) : 0;

    // Group by date for trend chart
    const grouped: Record<string, any> = {};

    bookings.forEach((booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];

      if (!grouped[date]) {
        grouped[date] = {
          date,
          pending: 0,
          confirmed: 0,
          active: 0,
          returned: 0,
          cancelled: 0,
          total: 0,
        };
      }

      if (booking.status in grouped[date]) {
        grouped[date][booking.status] += 1;
      }
      grouped[date].total += 1;
    });

    const data = Object.values(grouped).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      timeRange,
      data,
      summary: {
        totalBookings,
        pending: statusCounts.pending,
        confirmed: statusCounts.confirmed,
        active: statusCounts.active,
        returned: statusCounts.returned,
        cancelled: statusCounts.cancelled,
        conversionRate,
        cancellationRate,
      },
    });
  } catch (error: any) {
    console.error('Error fetching bookings analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings analytics', details: error.message },
      { status: 500 }
    );
  }
}
