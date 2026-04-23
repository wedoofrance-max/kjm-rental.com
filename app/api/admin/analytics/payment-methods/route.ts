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

    // Fetch all payments in the time range
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Count and sum by payment method
    const methodCounts: Record<string, { count: number; total: number; percentage: number }> = {};
    let totalAmount = 0;

    payments.forEach((payment) => {
      const method = payment.method || 'unknown';
      if (!methodCounts[method]) {
        methodCounts[method] = { count: 0, total: 0, percentage: 0 };
      }
      methodCounts[method].count += 1;
      methodCounts[method].total += payment.amount;
      totalAmount += payment.amount;
    });

    // Calculate percentages
    Object.keys(methodCounts).forEach((method) => {
      methodCounts[method].percentage = totalAmount > 0
        ? Math.round((methodCounts[method].total / totalAmount) * 100)
        : 0;
    });

    // Convert to array and sort by total amount (descending)
    const data = Object.entries(methodCounts)
      .map(([method, values]) => ({
        method,
        count: values.count,
        total: values.total,
        percentage: values.percentage,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      timeRange,
      data,
      summary: {
        totalPayments: payments.length,
        totalAmount,
        topMethod: data[0]?.method || 'N/A',
        paymentMethods: Object.keys(methodCounts),
      },
    });
  } catch (error: any) {
    console.error('Error fetching payment methods analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods analytics', details: error.message },
      { status: 500 }
    );
  }
}
