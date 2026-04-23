import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const format = searchParams.get('format') || 'csv'; // csv or json

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: startDate and endDate (ISO 8601 format)' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

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
        customer: true,
        vehicle: true,
        payment: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Prepare data for export
    const exportData = bookings.map((booking) => ({
      'Booking Reference': booking.reference,
      'Customer Name': `${booking.customer.firstName} ${booking.customer.lastName}`,
      'Customer Email': booking.customer.email,
      'Customer Phone': booking.customer.phone,
      'Vehicle': `${booking.vehicle.brand} ${booking.vehicle.model}`,
      'Pickup Date': booking.pickupDate.toISOString().split('T')[0],
      'Return Date': booking.returnDate.toISOString().split('T')[0],
      'Duration (days)': Math.ceil(
        (booking.returnDate.getTime() - booking.pickupDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
      'Base Price': booking.totalPrice,
      'Auto Discount': booking.autoDiscount,
      'Promo Discount': booking.promoDiscount,
      'Final Price': booking.finalPrice,
      'Deposit Required': booking.depositRequired,
      'Deposit Paid': booking.depositPaid ? 'Yes' : 'No',
      'Payment Method': booking.payment?.method || 'N/A',
      'Payment Status': booking.payment?.status || 'N/A',
      'Booking Status': booking.status,
      'Pickup Location': booking.pickupLocation,
      'Created At': booking.createdAt.toISOString(),
    }));

    if (format === 'json') {
      return NextResponse.json(exportData);
    }

    // Generate CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            // Escape quotes and wrap in quotes if contains comma or quote
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(',')
      ),
    ].join('\n');

    const fileName = `KJM-Financial-Statement-${startDateStr}-to-${endDateStr}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting financial data:', error);
    return NextResponse.json(
      { error: 'Failed to export financial data', details: error.message },
      { status: 500 }
    );
  }
}
