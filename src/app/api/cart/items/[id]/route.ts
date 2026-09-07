import { NextResponse } from 'next/server';
import { getCartIdentity } from '@/lib/cart-session';
import { CartService } from '@/services/cart.service';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

/**
 * PATCH /api/cart/items/[id]
 * Update cart item quantity
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const identity = await getCartIdentity();
    const itemId = params.id;
    const body = await req.json();
    const { quantity } = body;

    if (typeof quantity !== 'number') {
      return NextResponse.json(
        { error: 'Validation Error', message: 'quantity must be a number.' },
        { status: 400 }
      );
    }

    const result = await CartService.updateItemQuantity(identity, itemId, quantity);

    if (!result.success) {
      return NextResponse.json({ error: 'Cart Error', message: result.message }, { status: 400 });
    }

    const updatedCart = await CartService.getCartWithTotals(identity);
    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Error', message: 'Failed to update item quantity.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/items/[id]
 * Remove item from cart
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const identity = await getCartIdentity();
    const itemId = params.id;

    const result = await CartService.removeItemFromCart(identity, itemId);

    if (!result.success) {
      return NextResponse.json({ error: 'Cart Error', message: result.message }, { status: 400 });
    }

    const updatedCart = await CartService.getCartWithTotals(identity);
    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Error', message: 'Failed to remove item.' },
      { status: 500 }
    );
  }
}
