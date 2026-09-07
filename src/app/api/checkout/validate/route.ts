import { NextResponse } from 'next/server';
import { getCartIdentity } from '@/lib/cart-session';
import { CartService } from '@/services/cart.service';
import { CheckoutService } from '@/services/checkout.service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const identity = await getCartIdentity();
    const activeCart = await CartService.getOrCreateCart(identity);

    if (!activeCart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found or empty' },
        { status: 400 }
      );
    }

    const validation = await CheckoutService.validateCheckoutCart(activeCart.id);

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Cart validation failed' },
      { status: 400 }
    );
  }
}
