import { NextResponse } from 'next/server';
import { getCartIdentity } from '@/lib/cart-session';
import { CartService } from '@/services/cart.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cart/coupon
 * Apply coupon code
 */
export async function POST(req: Request) {
  try {
    const identity = await getCartIdentity();
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Validation Error', message: 'Promo code is required.' }, { status: 400 });
    }

    const result = await CartService.applyCoupon(identity, code);

    if (!result.success) {
      return NextResponse.json({ error: 'Coupon Error', message: result.message }, { status: 400 });
    }

    const updatedCart = await CartService.getCartWithTotals(identity);
    return NextResponse.json({ success: true, message: result.message, cart: updatedCart });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Error', message: 'Failed to apply promo code.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/coupon
 * Remove active coupon
 */
export async function DELETE() {
  try {
    const identity = await getCartIdentity();
    await CartService.removeCoupon(identity);
    const updatedCart = await CartService.getCartWithTotals(identity);
    return NextResponse.json({ success: true, message: 'Promo code removed.', cart: updatedCart });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Error', message: 'Failed to remove promo code.' },
      { status: 500 }
    );
  }
}
