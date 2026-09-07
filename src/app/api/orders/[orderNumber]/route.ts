import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';
import { OrderService } from '@/services/order.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const { orderNumber } = params;
    const { searchParams } = new URL(req.url);
    const guestToken = searchParams.get('token') || undefined;

    const customer = await getCurrentCustomer();

    const order = await OrderService.getOrderByNumber(orderNumber, {
      customerId: customer?.id,
      guestToken,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to retrieve order details' },
      { status: 500 }
    );
  }
}
