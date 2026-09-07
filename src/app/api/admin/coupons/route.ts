import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { logAdminAction } from '@/services/admin-audit.service';

export async function GET() {
  const authCheck = await requireAdminPermission('coupons.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  if (!process.env.DATABASE_URL) return NextResponse.json({ success: true, coupons: [] });

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      coupons: coupons.map((c) => ({
        id: c.id,
        code: c.code,
        discountType: c.discountType,
        discountValue: Number(c.discountValue),
        minOrderValue: Number(c.minOrderValue),
        maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
        usageLimit: c.usageLimit,
        usedCount: c.usedCount,
        startsAt: c.startsAt,
        expiresAt: c.expiresAt,
        isActive: c.isActive,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch coupons.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authCheck = await requireAdminPermission('coupons.manage');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiresAt } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ success: false, error: 'Code, discount type, and discount value are required.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ success: false, error: `Coupon code "${cleanCode}" already exists.` }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    await logAdminAction({
      adminUserId: authCheck.adminUser.id,
      action: 'COUPON_CREATED',
      entityType: 'Coupon',
      entityId: coupon.id,
      payload: { code: cleanCode, discountType, discountValue },
    });

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Coupon creation failed.' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const authCheck = await requireAdminPermission('coupons.manage');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const { couponId, isActive } = body;

    if (!couponId || typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Coupon ID and isActive state required.' }, { status: 400 });
    }

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive },
    });

    await logAdminAction({
      adminUserId: authCheck.adminUser.id,
      action: 'COUPON_STATUS_UPDATED',
      entityType: 'Coupon',
      entityId: couponId,
      payload: { isActive },
    });

    return NextResponse.json({
      success: true,
      coupon: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Coupon update failed.' }, { status: 400 });
  }
}
