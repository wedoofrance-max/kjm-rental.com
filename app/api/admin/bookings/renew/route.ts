import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId, newReturnDate } = body;

    if (!bookingId || !newReturnDate) {
      return NextResponse.json({ error: 'bookingId and newReturnDate are required' }, { status: 400 });
    }

    // Get the existing booking with vehicle and fleet unit info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: true,
        fleetUnit: true,
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if booking is renewable (must be confirmed or active)
    if (!['confirmed', 'active'].includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot renew booking with status "${booking.status}". Only confirmed or active bookings can be renewed.` },
        { status: 400 }
      );
    }

    const currentReturnDate = new Date(booking.returnDate);
    const newReturnDateObj = new Date(newReturnDate);

    // New return date must be AFTER the current return date
    if (newReturnDateObj <= currentReturnDate) {
      return NextResponse.json(
        { error: 'New return date must be after the current return date' },
        { status: 400 }
      );
    }

    // Check if the SAME fleet unit is available for the extended period
    if (booking.fleetUnitId) {
      const conflictingBookings = await prisma.booking.count({
        where: {
          fleetUnitId: booking.fleetUnitId,
          id: { not: bookingId }, // Exclude current booking
          status: { in: ['pending', 'confirmed', 'active'] },
          AND: [
            { pickupDate: { lt: newReturnDateObj } },
            { returnDate: { gt: currentReturnDate } },
          ],
        },
      });

      if (conflictingBookings > 0) {
        return NextResponse.json(
          { error: 'This scooter is already booked for the requested extension period. Please choose a different date or transfer to another unit.' },
          { status: 400 }
        );
      }
    }

    // Calculate the additional days and price
    const additionalDays = Math.ceil(
      (newReturnDateObj.getTime() - currentReturnDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate additional cost using tiered pricing
    const dailyRate = booking.vehicle.dailyRate;
    const weeklyRate = booking.vehicle.weeklyRate;
    const monthlyRate = booking.vehicle.monthlyRate;

    let additionalPrice = 0;
    let daysLeft = additionalDays;

    const months = Math.floor(daysLeft / 28);
    if (months > 0) {
      additionalPrice += months * (monthlyRate || dailyRate * 28);
      daysLeft -= months * 28;
    }

    const weeks = Math.floor(daysLeft / 7);
    if (weeks > 0) {
      additionalPrice += weeks * (weeklyRate || dailyRate * 7);
      daysLeft -= weeks * 7;
    }

    if (daysLeft > 0) {
      additionalPrice += daysLeft * dailyRate;
    }

    const newTotalPrice = booking.totalPrice + additionalPrice;
    const newFinalPrice = (booking.finalPrice || booking.totalPrice) + additionalPrice;

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        returnDate: newReturnDateObj,
        totalPrice: newTotalPrice,
        finalPrice: newFinalPrice,
      },
      include: {
        customer: true,
        vehicle: true,
        fleetUnit: true,
        payment: true,
      },
    });

    // Update payment amount
    if (booking.payment) {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { amount: newFinalPrice },
      });
    }

    // Invalidate the existing contract - customer must re-sign
    let contractInvalidated = false;
    try {
      const result = await prisma.contractSigning.deleteMany({
        where: { bookingReference: booking.reference },
      });
      contractInvalidated = result.count > 0;
    } catch (err) {
      console.log('No contract to invalidate for booking', booking.reference);
    }

    // URL where customer can re-sign the updated contract
    const contractResignUrl = `/booking/resign?reference=${booking.reference}`;

    return NextResponse.json({
      success: true,
      message: `Booking renewed successfully. Extended by ${additionalDays} days. ${contractInvalidated ? 'Contract requires re-signing.' : ''}`,
      booking: updatedBooking,
      renewal: {
        additionalDays,
        additionalPrice,
        newTotalPrice: newFinalPrice,
        previousReturnDate: currentReturnDate.toISOString().split('T')[0],
        newReturnDate: newReturnDateObj.toISOString().split('T')[0],
        contractStatus: contractInvalidated ? 'needs_resigning' : 'no_contract',
        contractResignUrl,
      },
    });
  } catch (error: any) {
    console.error('Error renewing booking:', error);
    return NextResponse.json(
      { error: 'Failed to renew booking', details: error.message },
      { status: 500 }
    );
  }
}
