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
    const limit = parseInt(searchParams.get('limit') || '5', 10);

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

    // Fetch all bookings with vehicle info in the time range
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
          },
        },
      },
    });

    // Group by vehicle
    const vehicleStats: Record<
      string,
      {
        vehicleId: string;
        name: string;
        count: number;
        revenue: number;
        averageBookingValue: number;
      }
    > = {};

    bookings.forEach((booking) => {
      const vehicleId = booking.vehicleId;
      const vehicleName = `${booking.vehicle.brand} ${booking.vehicle.model}`;

      if (!vehicleStats[vehicleId]) {
        vehicleStats[vehicleId] = {
          vehicleId,
          name: vehicleName,
          count: 0,
          revenue: 0,
          averageBookingValue: 0,
        };
      }

      vehicleStats[vehicleId].count += 1;
      vehicleStats[vehicleId].revenue += booking.finalPrice;
    });

    // Calculate average values and convert to array
    const data = Object.values(vehicleStats)
      .map((vehicle) => ({
        ...vehicle,
        averageBookingValue: vehicle.count > 0 ? Math.round(vehicle.revenue / vehicle.count) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return NextResponse.json({
      timeRange,
      data,
      summary: {
        totalVehicles: Object.keys(vehicleStats).length,
        topVehicle: data[0]?.name || 'N/A',
        totalRevenue: Object.values(vehicleStats).reduce((sum, v) => sum + v.revenue, 0),
        totalBookings: bookings.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching vehicle revenue analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle revenue analytics', details: error.message },
      { status: 500 }
    );
  }
}
