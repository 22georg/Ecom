import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NotificationService } from '@/services/notification.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { orderNumber } = params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Customer requested cancellation';

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order || order.customerId !== customer.id) {
      return NextResponse.json({ success: false, message: 'Order not found or unauthorized' }, { status: 404 });
    }

    // Cancellation Eligibility Check
    if (!['PENDING', 'PROCESSING'].includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Order cannot be cancelled because it is already in "${order.status}" status.`,
        },
        { status: 400 }
      );
    }

    // Atomic Cancellation & Stock Release Transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update Order Status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          notes: order.notes ? `${order.notes} | Cancelled: ${reason}` : `Cancelled: ${reason}`,
        },
      });

      // 2. Restore Inventory Stock for each variant
      for (const item of order.items) {
        if (item.variantId) {
          const invItem = await tx.inventoryItem.findFirst({
            where: { variantId: item.variantId },
          });

          if (invItem) {
            await tx.inventoryItem.update({
              where: { id: invItem.id },
              data: {
                quantityOnHand: {
                  increment: item.quantity,
                },
              },
            });

            await tx.inventoryMovement.create({
              data: {
                variantId: item.variantId,
                warehouseId: invItem.warehouseId,
                movementType: 'RELEASE',
                quantityDelta: item.quantity,
                referenceType: 'CANCEL',
                referenceId: order.id,
                notes: `Stock restored from cancelled Order #${order.orderNumber}`,
              },
            });
          }
        }
      }

      // 3. Log System Event
      await tx.systemEvent.create({
        data: {
          eventType: 'order.cancelled',
          payload: JSON.stringify({
            orderId: order.id,
            orderNumber: order.orderNumber,
            reason,
          }),
          status: 'PROCESSED',
        },
      });
    });

    // Notify customer
    await NotificationService.sendNotification({
      customerId: customer.id,
      type: 'ORDER_STATUS',
      title: `Order #${order.orderNumber} Cancelled`,
      message: `Your order has been cancelled successfully and reserved stock has been released.`,
      actionUrl: `/account/orders/${order.orderNumber}`,
    });

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber} has been successfully cancelled.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
