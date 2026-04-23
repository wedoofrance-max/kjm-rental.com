import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: startDate and endDate (ISO 8601 format)' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'startDate must be before endDate' },
        { status: 400 }
      );
    }

    // Fetch all bookings in the date range
    const bookings = await prisma.booking.findMany({
      where: {
        pickupDate: {
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
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        payment: {
          select: {
            method: true,
            status: true,
          },
        },
      },
    });

    // Calculate statistics
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      active: 0,
      returned: 0,
      cancelled: 0,
    };

    let totalRevenue = 0;
    let depositCollected = 0;
    let finalPayments = 0;
    const paymentBreakdown: Record<string, number> = {};
    const vehicleStats: Record<string, { count: number; revenue: number }> = {};

    bookings.forEach((booking) => {
      // Status counts
      if (booking.status in statusCounts) {
        statusCounts[booking.status as keyof typeof statusCounts] += 1;
      }

      // Revenue
      totalRevenue += booking.finalPrice;
      depositCollected += booking.depositPaid ? booking.depositRequired : 0;
      finalPayments += booking.finalPrice;

      // Payment methods
      const method = booking.payment?.method || 'unknown';
      paymentBreakdown[method] = (paymentBreakdown[method] || 0) + 1;

      // Vehicle stats
      const vehicleKey = booking.vehicleId;
      if (!vehicleStats[vehicleKey]) {
        vehicleStats[vehicleKey] = { count: 0, revenue: 0 };
      }
      vehicleStats[vehicleKey].count += 1;
      vehicleStats[vehicleKey].revenue += booking.finalPrice;
    });

    // Get top vehicles
    const topVehicles = await Promise.all(
      Object.entries(vehicleStats)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(async ([vehicleId, stats]) => {
          const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
            select: { brand: true, model: true },
          });
          return {
            vehicleId,
            name: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown',
            count: stats.count,
            revenue: stats.revenue,
          };
        })
    );

    const period = `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`;
    const averageBooking = bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0;

    // Create/update report in database
    const report = await prisma.rentalReport.create({
      data: {
        period,
        startDate,
        endDate,
        totalBookings: bookings.length,
        confirmedCount: statusCounts.confirmed,
        activeCount: statusCounts.active,
        returnedCount: statusCounts.returned,
        cancelledCount: statusCounts.cancelled,
        totalRevenue,
        depositCollected,
        finalPayments,
        averageBooking,
        paymentBreakdown: JSON.stringify(paymentBreakdown),
        topVehicles: JSON.stringify(topVehicles),
      },
    });

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        paymentBreakdown: typeof report.paymentBreakdown === 'string'
          ? JSON.parse(report.paymentBreakdown)
          : report.paymentBreakdown || {},
        topVehicles: typeof report.topVehicles === 'string'
          ? JSON.parse(report.topVehicles)
          : report.topVehicles || [],
        bookings: bookings.length,
        summaryBookings: bookings.map((b) => ({
          reference: b.reference,
          customer: `${b.customer.firstName} ${b.customer.lastName}`,
          vehicle: `${b.vehicle.brand} ${b.vehicle.model}`,
          dates: `${b.pickupDate.toISOString().split('T')[0]} to ${b.returnDate.toISOString().split('T')[0]}`,
          amount: b.finalPrice,
          status: b.status,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error generating rental report:', error);
    return NextResponse.json(
      { error: 'Failed to generate rental report', details: error.message },
      { status: 500 }
    );
  }
}
