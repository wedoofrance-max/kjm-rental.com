import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

/**
 * GET /api/admin/promo-codes
 * List all promo codes (admin only)
 *
 * Query params:
 * - active: boolean (default: all)
 * - includeExpired: boolean (default: false)
 */
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const activeOnly = url.searchParams.get('active');
    const includeExpired = url.searchParams.get('includeExpired') === 'true';

    const now = new Date();

    let where: any = {};

    // Filter by active status
    if (activeOnly !== null) {
      where.isActive = activeOnly === 'true';
    }

    // Exclude expired by default
    if (!includeExpired) {
      where.expiresAt = { gte: now };
    }

    const promoCodes = await prisma.promoCode.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        minNights: true,
        maxUsage: true,
        usageCount: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Calculate days until expiry for each code
    const codesWithDaysLeft = promoCodes.map((code) => ({
      ...code,
      daysLeft: Math.ceil((new Date(code.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      isExpired: new Date(code.expiresAt) <= now,
    }));

    const stats = {
      total: codesWithDaysLeft.length,
      active: codesWithDaysLeft.filter((c) => c.isActive && !c.isExpired).length,
      expired: codesWithDaysLeft.filter((c) => c.isExpired).length,
      totalUsages: codesWithDaysLeft.reduce((sum, c) => sum + c.usageCount, 0),
    };

    return NextResponse.json({
      success: true,
      stats,
      promoCodes: codesWithDaysLeft,
      timestamp: now,
    });
  } catch (err: any) {
    console.error('Error fetching promo codes:', err);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/promo-codes
 * Create a new promo code (admin only)
 *
 * Body: {
 *   code: string (unique, auto-uppercase),
 *   type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_DAYS",
 *   value: number,
 *   minNights?: number,
 *   maxUsage?: number,
 *   expiresAt: string (ISO date, must be <= today + 30 days)
 * }
 */
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code, type, value, minNights, maxUsage, expiresAt } = body;

    // Validation
    if (!code || !type || !value || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields: code, type, value, expiresAt' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_DAYS'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be PERCENTAGE, FIXED_AMOUNT, or FREE_DAYS' },
        { status: 400 }
      );
    }

    // Validate value
    if (typeof value !== 'number' || value <= 0) {
      return NextResponse.json(
        { error: 'Value must be a positive number' },
        { status: 400 }
      );
    }

    // Validate expiry date (must be <= 30 days from now)
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    const maxExpiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (expiryDate > maxExpiryDate) {
      return NextResponse.json(
        { error: `Expiry date must be within 30 days from today. Maximum: ${maxExpiryDate.toISOString().split('T')[0]}` },
        { status: 400 }
      );
    }

    if (expiryDate <= today) {
      return NextResponse.json(
        { error: 'Expiry date must be in the future' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Promo code "${code.toUpperCase()}" already exists` },
        { status: 400 }
      );
    }

    // Create promo code
    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        minNights: minNights || null,
        maxUsage: maxUsage || null,
        expiresAt: expiryDate,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      promoCode,
      message: `Promo code "${promoCode.code}" created successfully`,
    });
  } catch (err: any) {
    console.error('Error creating promo code:', err);
    return NextResponse.json(
      { error: 'Failed to create promo code', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/promo-codes/[id]
 * Update a promo code (admin only)
 */
export async function PATCH(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Promo code ID required' },
        { status: 400 }
      );
    }

    const { isActive, expiresAt } = body;

    // Validate if expiresAt is being updated
    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      const today = new Date();
      const maxExpiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (expiryDate > maxExpiryDate) {
        return NextResponse.json(
          { error: `Expiry date must be within 30 days from today` },
          { status: 400 }
        );
      }
    }

    // Update promo code
    const updated = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
      },
    });

    return NextResponse.json({
      success: true,
      promoCode: updated,
      message: `Promo code updated successfully`,
    });
  } catch (err: any) {
    console.error('Error updating promo code:', err);
    return NextResponse.json(
      { error: 'Failed to update promo code', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/promo-codes/[id]
 * Soft delete a promo code (sets isActive to false, admin only)
 */
export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Promo code ID required' },
        { status: 400 }
      );
    }

    // Soft delete (set isActive to false)
    const deleted = await prisma.promoCode.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: `Promo code "${deleted.code}" has been deactivated`,
    });
  } catch (err: any) {
    console.error('Error deleting promo code:', err);
    return NextResponse.json(
      { error: 'Failed to delete promo code', details: err.message },
      { status: 500 }
    );
  }
}
