import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/**
 * POST /api/promo-codes/validate
 * Client-side promo code validation
 *
 * Body: { code: string, days: number, vehicleId: string }
 * Returns: { valid: boolean, discount?: number, type?: string, error?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { code, days, vehicleId } = await req.json();

    // Validation
    if (!code || !days || !vehicleId) {
      return NextResponse.json(
        { valid: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (days <= 0) {
      return NextResponse.json(
        { valid: false, error: 'Invalid number of days' },
        { status: 400 }
      );
    }

    // Get promo code
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      return NextResponse.json({
        valid: false,
        error: 'Code not found',
      });
    }

    // Check if active
    if (!promoCode.isActive) {
      return NextResponse.json({
        valid: false,
        error: 'Code is inactive',
      });
    }

    // Check expiry date
    if (new Date() > new Date(promoCode.expiresAt)) {
      return NextResponse.json({
        valid: false,
        error: 'Code has expired',
      });
    }

    // Check usage limit
    if (promoCode.maxUsage && promoCode.usageCount >= promoCode.maxUsage) {
      return NextResponse.json({
        valid: false,
        error: 'Code usage limit reached',
      });
    }

    // Check minimum nights requirement
    if (promoCode.minNights && days < promoCode.minNights) {
      return NextResponse.json({
        valid: false,
        error: `Code requires minimum ${promoCode.minNights} nights (you selected ${days})`,
      });
    }

    // Get vehicle rates for discount calculation
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { valid: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    switch (promoCode.type) {
      case 'PERCENTAGE':
        // For percentage, we'd need base price which requires tiered calculation
        // For now, use daily rate as approximation
        discountAmount = Math.floor((vehicle.dailyRate * days * promoCode.value) / 100);
        break;

      case 'FIXED_AMOUNT':
        discountAmount = promoCode.value;
        break;

      case 'FREE_DAYS':
        discountAmount = promoCode.value * vehicle.dailyRate;
        break;

      default:
        discountAmount = 0;
    }

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      type: promoCode.type,
      discount: discountAmount,
      expiresAt: promoCode.expiresAt,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { valid: false, error: 'Error validating code' },
      { status: 500 }
    );
  }
}
