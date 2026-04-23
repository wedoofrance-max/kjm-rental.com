import { prisma } from './db';

/**
 * Smart pricing engine for KJM Motors
 *
 * Features:
 * 1. Tiered pricing (daily, weekly, monthly)
 * 2. Auto discount: 7+ nights = free 2 days (weekend)
 * 3. Optional promo codes with multiple discount types
 */

export interface VehicleRates {
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
}

export interface DiscountBreakdown {
  type: 'WEEKEND_FREE' | 'PROMO_CODE' | 'BOTH';
  autoDiscount: number; // Value of auto-discount
  promoDiscount: number; // Value of promo discount
  totalDiscount: number; // Sum of both
}

export interface PricingResult {
  basePrice: number; // Price before any discounts
  autoDiscount: number; // -2 days value if 7+ nights
  promoDiscount: number; // Discount from promo code
  finalPrice: number; // basePrice - autoDiscount - promoDiscount
  discountType: string | null; // "WEEKEND_FREE" | "PROMO_CODE" | "BOTH"
  breakdown: {
    rates: VehicleRates;
    duration: number; // Original duration
    daysAfterAutoDiscount: number; // Duration after -2 days applied
    weekendFree: boolean; // Was 7+ night discount applied?
    promoCodeUsed: string | null;
  };
}

/**
 * Calculate tiered price based on duration
 * - 1-6 days: daily rate * days
 * - 7-27 days: weekly rate * weeks + daily rate * remaining days
 * - 28+ days: monthly rate * months + daily rate * remaining days
 */
export function calcTieredPrice(
  days: number,
  dailyRate: number,
  weeklyRate: number,
  monthlyRate: number
): number {
  if (days >= 28) {
    const months = Math.floor(days / 28);
    const remaining = days % 28;
    return months * monthlyRate + remaining * dailyRate;
  }

  if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const remaining = days % 7;
    return weeks * weeklyRate + remaining * dailyRate;
  }

  return days * dailyRate;
}

/**
 * Apply automatic weekend discount: 7+ nights = 2 days free
 */
export function applyAutoDiscount(
  days: number,
  dailyRate: number
): {
  newDays: number;
  discountValue: number;
  applied: boolean;
} {
  const WEEKEND_FREE_THRESHOLD = 7;
  const WEEKEND_FREE_DAYS = 2;

  if (days >= WEEKEND_FREE_THRESHOLD) {
    const newDays = days - WEEKEND_FREE_DAYS;
    const discountValue = WEEKEND_FREE_DAYS * dailyRate;
    return {
      newDays,
      discountValue,
      applied: true,
    };
  }

  return {
    newDays: days,
    discountValue: 0,
    applied: false,
  };
}

/**
 * Validate and get promo code details
 */
export async function validatePromoCode(
  code: string,
  days: number
): Promise<{
  valid: boolean;
  error?: string;
  promoCode?: any;
} | null> {
  if (!code) return null;

  try {
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      return { valid: false, error: 'Code not found' };
    }

    // Check if active
    if (!promoCode.isActive) {
      return { valid: false, error: 'Code is inactive' };
    }

    // Check expiry date
    if (new Date() > new Date(promoCode.expiresAt)) {
      return { valid: false, error: 'Code has expired' };
    }

    // Check usage limit
    if (promoCode.maxUsage && promoCode.usageCount >= promoCode.maxUsage) {
      return { valid: false, error: 'Code usage limit reached' };
    }

    // Check minimum nights requirement
    if (promoCode.minNights && days < promoCode.minNights) {
      return {
        valid: false,
        error: `Code requires minimum ${promoCode.minNights} nights (you selected ${days})`,
      };
    }

    return { valid: true, promoCode };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return { valid: false, error: 'Error validating code' };
  }
}

/**
 * Calculate promo code discount amount
 */
export function calculatePromoDiscount(
  basePrice: number,
  dailyRate: number,
  promoCode: any
): number {
  if (!promoCode) return 0;

  switch (promoCode.type) {
    case 'PERCENTAGE':
      return Math.floor((basePrice * promoCode.value) / 100);

    case 'FIXED_AMOUNT':
      return promoCode.value;

    case 'FREE_DAYS':
      return promoCode.value * dailyRate;

    default:
      return 0;
  }
}

/**
 * Main pricing calculation function
 */
export async function calculatePrice(
  vehicleId: string,
  pickupDate: Date,
  returnDate: Date,
  promoCode?: string
): Promise<PricingResult> {
  // Get vehicle rates
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  const rates: VehicleRates = {
    dailyRate: vehicle.dailyRate,
    weeklyRate: vehicle.weeklyRate,
    monthlyRate: vehicle.monthlyRate,
  };

  // Calculate duration
  const duration = Math.ceil(
    (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (duration <= 0) {
    throw new Error('Invalid dates: return date must be after pickup date');
  }

  // Calculate base price (before discounts)
  const basePrice = calcTieredPrice(
    duration,
    rates.dailyRate,
    rates.weeklyRate,
    rates.monthlyRate
  );

  // Apply automatic weekend discount (7+ nights)
  const autoDiscountResult = applyAutoDiscount(duration, rates.dailyRate);
  const priceAfterAutoDiscount = calcTieredPrice(
    autoDiscountResult.newDays,
    rates.dailyRate,
    rates.weeklyRate,
    rates.monthlyRate
  );
  const autoDiscount = basePrice - priceAfterAutoDiscount;

  // Apply promo code discount (if provided)
  let promoDiscount = 0;
  let appliedPromoCode = null;
  let discountType: string | null = null;

  if (promoCode) {
    const validation = await validatePromoCode(promoCode, duration);
    if (validation?.valid && validation.promoCode) {
      appliedPromoCode = validation.promoCode;
      promoDiscount = calculatePromoDiscount(
        priceAfterAutoDiscount, // Apply on price after auto-discount
        rates.dailyRate,
        appliedPromoCode
      );
    }
  }

  // Determine discount type
  if (autoDiscountResult.applied && promoDiscount > 0) {
    discountType = 'BOTH';
  } else if (autoDiscountResult.applied) {
    discountType = 'WEEKEND_FREE';
  } else if (promoDiscount > 0) {
    discountType = 'PROMO_CODE';
  }

  // Calculate final price
  const finalPrice = Math.max(0, priceAfterAutoDiscount - promoDiscount);

  return {
    basePrice,
    autoDiscount,
    promoDiscount,
    finalPrice,
    discountType,
    breakdown: {
      rates,
      duration,
      daysAfterAutoDiscount: autoDiscountResult.newDays,
      weekendFree: autoDiscountResult.applied,
      promoCodeUsed: appliedPromoCode?.code || null,
    },
  };
}

/**
 * Increment promo code usage after booking confirmation
 */
export async function incrementPromoCodeUsage(promoCodeId: string) {
  try {
    await prisma.promoCode.update({
      where: { id: promoCodeId },
      data: {
        usageCount: { increment: 1 },
      },
    });
  } catch (error) {
    console.error('Error incrementing promo code usage:', error);
  }
}
