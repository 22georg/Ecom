import { NextResponse } from 'next/server';
import { getCartIdentity } from '@/lib/cart-session';
import { CartService } from '@/services/cart.service';
import { ShippingService } from '@/services/shipping.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cart/shipping-methods
 * Retrieve available shipping methods for current cart
 */
export async function GET() {
  try {
    const identity = await getCartIdentity();
    const cart = await CartService.getCartWithTotals(identity);
    const methods = ShippingService.getAvailableShippingMethods(cart.subtotal);
    return NextResponse.json({ shippingMethods: methods });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Error', message: 'Failed to retrieve shipping methods.' },
      { status: 500 }
    );
  }
}
