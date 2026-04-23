import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { sendBookingNotification } from '../../../lib/email';
import { calculatePrice } from '../../../lib/pricing-engine';

function generateReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 900000 + 100000);
  return `KJM-${date}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vehicleId,
      pickupDate,
      returnDate,
      pickupLocation,
      pickupAddress,
      firstName,
      lastName,
      email,
      phone,
      nationality,
      paymentMethod,
      totalPrice,
      depositMethod,
      promoCode,
    } = body;

    if (!vehicleId || !pickupDate || !returnDate || !firstName || !lastName || !email || !phone || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate price using pricing engine (includes auto-discount and promo code handling)
    let pricing;
    try {
      pricing = await calculatePrice(
        vehicleId,
        new Date(pickupDate),
        new Date(returnDate),
        promoCode || undefined
      );
    } catch (err) {
      console.error('Pricing calculation error:', err);
      return NextResponse.json({ error: 'Failed to calculate pricing' }, { status: 400 });
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { firstName, lastName, email, phone, nationality: nationality || null },
      });
    }

    // Assign the first available fleet unit (scooter)
    const fleetUnit = await prisma.fleetUnit.findFirst({
      where: {
        vehicleId,
        status: 'available', // Only units that are not in maintenance or rented
      },
      orderBy: { unitNumber: 'asc' }, // Assign in order (HB01, HB02, etc.)
    });

    if (!fleetUnit) {
      return NextResponse.json(
        { error: `No ${vehicleId} units available for these dates. Please try different dates or another vehicle.` },
        { status: 400 }
      );
    }

    // Determine discount type
    let discountType = 'NONE';
    if (pricing.autoDiscount > 0 && pricing.promoDiscount > 0) {
      discountType = 'BOTH';
    } else if (pricing.autoDiscount > 0) {
      discountType = 'WEEKEND_FREE';
    } else if (pricing.promoDiscount > 0) {
      discountType = 'PROMO_CODE';
    }

    const booking = await prisma.booking.create({
      data: {
        reference: generateReference(),
        customerId: customer.id,
        vehicleId,
        fleetUnitId: fleetUnit.id, // MUST have a fleet unit assigned
        pickupDate: new Date(pickupDate),
        returnDate: new Date(returnDate),
        pickupLocation,
        pickupAddress: pickupAddress || null,
        totalPrice: pricing.finalPrice,
        finalPrice: pricing.finalPrice,
        autoDiscount: pricing.autoDiscount,
        promoDiscount: pricing.promoDiscount,
        discountType,
        promoCodeId: null, // Will be set if we track individual code usage
        depositPaid: depositMethod === 'passport',
        status: 'pending',
        payment: {
          create: {
            method: paymentMethod,
            amount: pricing.finalPrice,
            status: 'pending',
          },
        },
      },
      include: { vehicle: true, customer: true },
    });

    // Increment promo code usage if applicable
    if (promoCode && pricing.promoDiscount > 0) {
      await prisma.promoCode.updateMany({
        where: { code: promoCode.toUpperCase(), isActive: true },
        data: { usageCount: { increment: 1 } },
      });
    }

    const days = Math.ceil(
      (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / 86400000
    );

    sendBookingNotification({
      reference: booking.reference,
      vehicle: `${booking.vehicle.brand} ${booking.vehicle.model}`,
      pickupDate,
      returnDate,
      days,
      totalPrice: booking.totalPrice,
      pickupLocation,
      pickupAddress,
      firstName,
      lastName,
      email,
      phone,
      nationality,
      paymentMethod,
    }).catch((err) => console.error('Email notification failed:', err));

    return NextResponse.json({
      success: true,
      reference: booking.reference,
      booking: {
        id: booking.id,
        reference: booking.reference,
        vehicle: `${booking.vehicle.brand} ${booking.vehicle.model}`,
        pickupDate: booking.pickupDate,
        returnDate: booking.returnDate,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: 'Booking creation failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'reference required' }, { status: 400 });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { reference },
      include: { vehicle: true, customer: true, payment: true },
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
