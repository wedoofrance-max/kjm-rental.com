import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'reference required' }, { status: 400 });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { reference },
      include: {
        vehicle: true,
        customer: true,
        fleetUnit: true,
        payment: true,
      },
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Calculate rental period details
    const days = Math.ceil(
      (booking.returnDate.getTime() - booking.pickupDate.getTime()) / 86400000
    );

    return NextResponse.json({
      success: true,
      booking: {
        reference: booking.reference,
        status: booking.status,

        // Customer info
        customerName: booking.customer.firstName + ' ' + booking.customer.lastName,
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone,
        customerNationality: booking.customer.nationality,

        // Vehicle info
        vehicleBrand: booking.vehicle.brand,
        vehicleModel: booking.vehicle.model,
        vehicleEngine: booking.vehicle.engine,
        vehicleYear: 2024, // This could be added to the Vehicle model if needed
        vehiclePlateNumber: booking.fleetUnit?.licensePlate || 'TBD',

        // Rental period
        pickupDate: booking.pickupDate.toISOString().split('T')[0],
        returnDate: booking.returnDate.toISOString().split('T')[0],
        days,

        // Pricing
        basePrice: booking.totalPrice,
        autoDiscount: booking.autoDiscount,
        promoDiscount: booking.promoDiscount,
        finalPrice: booking.finalPrice || booking.totalPrice,
        deposit: booking.depositRequired,

        // Delivery
        deliveryType: booking.pickupLocation,
        deliveryAddress: booking.pickupAddress,
      },
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json({ error: 'Failed to fetch booking details' }, { status: 500 });
  }
}
