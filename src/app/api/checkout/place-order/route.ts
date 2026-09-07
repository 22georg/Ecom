import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCartIdentity } from '@/lib/cart-session';
import { getCurrentCustomer } from '@/lib/auth';
import { CartService } from '@/services/cart.service';
import { OrderService } from '@/services/order.service';

export const dynamic = 'force-dynamic';

const PlaceOrderSchema = z.object({
  guestEmail: z.string().email('Invalid email address').optional(),
  shippingName: z.string().min(2, 'Name must be at least 2 characters'),
  shippingPhone: z.string().min(8, 'Phone number must be at least 8 digits'),
  shippingAddress: z.string().min(5, 'Full street address is required'),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingCountry: z.string().optional(),
  billingName: z.string().optional(),
  billingAddress: z.string().optional(),
  notes: z.string().optional(),
  paymentProvider: z.string().min(2, 'Payment provider is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = PlaceOrderSchema.parse(body);

    const customer = await getCurrentCustomer();
    const identity = await getCartIdentity();

    // Get active cart
    const activeCart = await CartService.getOrCreateCart(identity);

    if (!activeCart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found or empty' },
        { status: 400 }
      );
    }

    if (!customer && !validatedData.guestEmail) {
      return NextResponse.json(
        { success: false, message: 'Guest email is required for guest checkout' },
        { status: 400 }
      );
    }

    // Execute atomic order creation
    const result = await OrderService.placeOrder({
      cartId: activeCart.id,
      customerId: customer?.id,
      guestEmail: validatedData.guestEmail,
      shippingName: validatedData.shippingName,
      shippingPhone: validatedData.shippingPhone,
      shippingAddress: validatedData.shippingAddress,
      shippingCity: validatedData.shippingCity,
      shippingState: validatedData.shippingState,
      shippingPostalCode: validatedData.shippingPostalCode,
      shippingCountry: validatedData.shippingCountry || 'BD',
      billingName: validatedData.billingName,
      billingAddress: validatedData.billingAddress,
      notes: validatedData.notes,
      paymentProvider: validatedData.paymentProvider,
    });

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: result.order.orderNumber,
        grandTotal: result.order.grandTotal,
        paymentStatus: result.order.paymentStatus,
        guestToken: result.guestToken,
        redirectUrl: result.redirectUrl,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: err.errors[0].message, errors: err.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: err.message || 'Order placement failed. Please try again.' },
      { status: 400 }
    );
  }
}
