import { NextRequest, NextResponse } from 'next/server';
import { calculatePrice } from '../../../lib/pricing-engine';

/**
 * GET /api/pricing
 * Calculate booking price with smart pricing and optional promo codes
 *
 * Query params:
 * - vehicleId: string (required)
 * - days: number (required) OR pickupDate & returnDate (ISO strings)
 * - promoCode?: string (optional)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get('vehicleId');
  const daysParam = searchParams.get('days');
  const pickupDateParam = searchParams.get('pickupDate');
  const returnDateParam = searchParams.get('returnDate');
  const promoCode = searchParams.get('promoCode') || undefined;

  // Validate vehicle ID
  if (!vehicleId) {
    return NextResponse.json({ error: 'vehicleId is required' }, { status: 400 });
  }

  // Get dates from either days or pickupDate/returnDate
  let pickupDate: Date;
  let returnDate: Date;

  if (pickupDateParam && returnDateParam) {
    pickupDate = new Date(pickupDateParam);
    returnDate = new Date(returnDateParam);

    if (isNaN(pickupDate.getTime()) || isNaN(returnDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO strings (YYYY-MM-DD)' },
        { status: 400 }
      );
    }
  } else if (daysParam) {
    const days = parseInt(daysParam, 10);
    if (isNaN(days) || days < 1) {
      return NextResponse.json(
        { error: 'days must be a positive number' },
        { status: 400 }
      );
    }

    // Calculate dates from days (starting from today)
    pickupDate = new Date();
    pickupDate.setHours(0, 0, 0, 0);
    returnDate = new Date(pickupDate);
    returnDate.setDate(returnDate.getDate() + days);
  } else {
    return NextResponse.json(
      { error: 'Either "days" or both "pickupDate" and "returnDate" are required' },
      { status: 400 }
    );
  }

  try {
    // Calculate price using smart pricing engine
    const pricing = await calculatePrice(vehicleId, pickupDate, returnDate, promoCode);

    return NextResponse.json({
      success: true,
      vehicleId,
      pickupDate,
      returnDate,
      duration: pricing.breakdown.duration,
      rates: pricing.breakdown.rates,
      basePrice: pricing.basePrice,
      autoDiscount: pricing.autoDiscount,
      autoDiscountApplied: pricing.breakdown.weekendFree,
      promoCode: promoCode || null,
      promoDiscount: pricing.promoDiscount,
      discountType: pricing.discountType,
      finalPrice: pricing.finalPrice,
      deposit: 2500,
      breakdown: {
        duration: pricing.breakdown.duration,
        daysAfterAutoDiscount: pricing.breakdown.daysAfterAutoDiscount,
        weekendFreeApplied: pricing.breakdown.weekendFree,
        promoCodeUsed: pricing.breakdown.promoCodeUsed,
      },
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Pricing calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Pricing calculation failed' },
      { status: 500 }
    );
  }
}
