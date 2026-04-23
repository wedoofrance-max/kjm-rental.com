import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { subHours, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // 24h, 7d, 30d

    let startDate: Date;
    let interval: number; // for grouping: 1 hour, 1 day, etc

    if (timeRange === '24h') {
      startDate = subHours(new Date(), 24);
      interval = 60; // group by hour
    } else if (timeRange === '30d') {
      startDate = subDays(new Date(), 30);
      interval = 1440; // group by day
    } else {
      // default 7d
      startDate = subDays(new Date(), 7);
      interval = 1440; // group by day
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
      select: {
        createdAt: true,
        finalPrice: true,
        depositRequired: true,
        depositPaid: true,
        totalPrice: true,
        autoDiscount: true,
        promoDiscount: true,
      },
    });

    // Group by date or hour
    const grouped: Record<string, any> = {};

    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt);

      let key: string;
      if (timeRange === '24h') {
        // Group by hour
        const hour = date.toISOString().slice(0, 13);
        key = hour;
      } else {
        // Group by day
        key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          totalRevenue: 0,
          depositCollected: 0,
          finalPayments: 0,
          bookingCount: 0,
        };
      }

      grouped[key].totalRevenue += booking.finalPrice;
      grouped[key].depositCollected += booking.depositPaid ? booking.depositRequired : 0;
      grouped[key].finalPayments += booking.finalPrice;
      grouped[key].bookingCount += 1;
    });

    // Convert to array and sort by date
    const data = Object.values(grouped).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate period-over-period comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const previousBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: startDate,
        },
      },
      select: {
        finalPrice: true,
        depositRequired: true,
        depositPaid: true,
      },
    });

    const previousTotal = previousBookings.reduce((sum, b) => sum + b.finalPrice, 0);
    const currentTotal = bookings.reduce((sum, b) => sum + b.finalPrice, 0);
    const comparison = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    return NextResponse.json({
      timeRange,
      data,
      summary: {
        totalRevenue: currentTotal,
        depositCollected: bookings.reduce((sum, b) => sum + (b.depositPaid ? b.depositRequired : 0), 0),
        finalPayments: currentTotal,
        bookingCount: bookings.length,
        comparison: {
          percentage: Math.round(comparison * 100) / 100,
          direction: comparison > 0 ? 'up' : 'down',
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics', details: error.message },
      { status: 500 }
    );
  }
}
