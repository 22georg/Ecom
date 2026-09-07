import { NextResponse } from 'next/server';
import { getCartIdentity } from '@/lib/cart-session';
import { CartService } from '@/services/cart.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cart
 * Retrieve active cart with backend-authoritative pricing calculations & stock revalidation
 */
export async function GET() {
  try {
    const identity = await getCartIdentity();
    const cart = await CartService.getCartWithTotals(identity);
    return NextResponse.json({ cart });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Error', message: 'Failed to retrieve cart.' },
      { status: 500 }
    );
  }
}
