import { NextResponse } from 'next/server';
import { getCartIdentity } from '@/lib/cart-session';
import { CartService } from '@/services/cart.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cart/items
 * Add variant item to cart
 */
export async function POST(req: Request) {
  try {
    const identity = await getCartIdentity();
    const body = await req.json();
    const { variantId, quantity } = body;

    if (!variantId || typeof variantId !== 'string') {
      return NextResponse.json(
        { error: 'Validation Error', message: 'variantId is required.' },
        { status: 400 }
      );
    }

    const qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
    const result = await CartService.addItemToCart(identity, variantId, qty);

    if (!result.success) {
      return NextResponse.json({ error: 'Cart Error', message: result.message }, { status: 400 });
    }

    const updatedCart = await CartService.getCartWithTotals(identity);
    return NextResponse.json({
      success: true,
      message: result.message,
      cart: updatedCart,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Error', message: 'Failed to add item to cart.' },
      { status: 500 }
    );
  }
}
