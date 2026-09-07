import { NextResponse } from 'next/server';
import { getCartIdentity } from '@/lib/cart-session';
import { CartService } from '@/services/cart.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cart/shipping-method
 * Select shipping method
 */
export async function POST(req: Request) {
  try {
    const identity = await getCartIdentity();
    const body = await req.json();
    const { shippingMethodId } = body;

    if (!shippingMethodId || typeof shippingMethodId !== 'string') {
      return NextResponse.json(
        { error: 'Validation Error', message: 'shippingMethodId is required.' },
        { status: 400 }
      );
    }

    await CartService.selectShippingMethod(identity, shippingMethodId);
    const updatedCart = await CartService.getCartWithTotals(identity);

    return NextResponse.json({
      success: true,
      message: 'Shipping method updated.',
      cart: updatedCart,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Error', message: 'Failed to update shipping method.' },
      { status: 500 }
    );
  }
}
