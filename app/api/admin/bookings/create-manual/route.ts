import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import crypto from 'crypto';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      nationality,
      vehicleId,
      pickupDate,
      returnDate,
      pickupLocation,
      pickupAddress,
      paymentMethod,
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !vehicleId || !pickupDate || !returnDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get vehicle to calculate pricing
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Calculate days
    const pickup = new Date(pickupDate);
    const returnDateObj = new Date(returnDate);
    const days = Math.ceil((returnDateObj.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return NextResponse.json({ error: 'Return date must be after pickup date' }, { status: 400 });
    }

    // Calculate price (tiered)
    let totalPrice = 0;
    let daysLeft = days;
    const dailyRate = vehicle.dailyRate;
    const weeklyRate = vehicle.weeklyRate;
    const monthlyRate = vehicle.monthlyRate;

    // Monthly: 4 weeks = 28 days
    const months = Math.floor(daysLeft / 28);
    if (months > 0) {
      totalPrice += months * (monthlyRate || dailyRate * 28);
      daysLeft -= months * 28;
    }

    // Weekly: 7 days
    const weeks = Math.floor(daysLeft / 7);
    if (weeks > 0) {
      totalPrice += weeks * (weeklyRate || dailyRate * 7);
      daysLeft -= weeks * 7;
    }

    // Daily
    if (daysLeft > 0) {
      totalPrice += daysLeft * dailyRate;
    }

    // Apply auto-discount for 7+ nights (2 days free)
    let autoDiscount = 0;
    if (days >= 7) {
      autoDiscount = dailyRate * 2; // 2 days free
    }

    const finalPrice = totalPrice - autoDiscount;

    // Auto-assign first available fleet unit
    const fleetUnit = await prisma.fleetUnit.findFirst({
      where: {
        vehicleId,
        status: 'available',
      },
      orderBy: { unitNumber: 'asc' },
    });

    if (!fleetUnit) {
      return NextResponse.json(
        { error: 'No available fleet units for the selected vehicle' },
        { status: 400 }
      );
    }

    // Generate booking reference
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getFullYear()).slice(-2)}`;
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const reference = `KJM-${dateStr}-${randomNum}`;

    // Create customer and booking
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || '',
        nationality: nationality || '',
      },
    });

    const booking = await prisma.booking.create({
      data: {
        reference,
        customerId: customer.id,
        vehicleId,
        fleetUnitId: fleetUnit.id,
        pickupDate: pickup,
        returnDate: returnDateObj,
        pickupLocation,
        pickupAddress: pickupAddress || '',
        totalPrice,
        finalPrice,
        autoDiscount,
        promoDiscount: 0,
        discountType: days >= 7 ? 'WEEKEND_FREE' : null,
        status: 'pending', // Manual bookings start as pending until confirmed
        depositRequired: 2500,
        depositPaid: false,
      },
      include: {
        customer: true,
        vehicle: true,
        fleetUnit: true,
        payment: true,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        method: paymentMethod || 'cash_on_delivery',
        status: 'pending',
        amount: finalPrice,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      reference: booking.reference,
      booking,
    });
  } catch (error: any) {
    console.error('Error creating manual booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking', details: error.message },
      { status: 500 }
    );
  }
}
