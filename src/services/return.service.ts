import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { NotificationService } from './notification.service';

export interface CreateReturnItemInput {
  orderItemId: string;
  variantId?: string;
  quantity: number;
  reason?: string;
}

export interface CreateReturnInput {
  orderId: string;
  reason: string;
  customerNote?: string;
  items: CreateReturnItemInput[];
}

export const ReturnService = {
  /**
   * Submit return request for an eligible delivered order
   */
  async createReturnRequest(customerId: string, input: CreateReturnInput) {
    // 1. Fetch Order and verify ownership
    const order = await prisma.order.findFirst({
      where: { id: input.orderId, customerId },
      include: { items: true, returns: { include: { items: true } } },
    });

    if (!order) {
      throw new Error('Order not found or unauthorized.');
    }

    // 2. Return Eligibility: Order must be DELIVERED or COMPLETED
    if (order.status !== 'DELIVERED') {
      throw new Error('Returns can only be requested for delivered orders.');
    }

    // 3. Return Policy Window: 14 days from order creation/delivery
    const returnDeadline = new Date(order.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    if (new Date() > returnDeadline) {
      throw new Error('The 14-day return window for this order has expired.');
    }

    // 4. Validate item quantities against previously returned items
    for (const itemInput of input.items) {
      const orderItem = order.items.find((oi) => oi.id === itemInput.orderItemId);
      if (!orderItem) {
        throw new Error(`Invalid order item selected for return.`);
      }

      // Sum already returned quantity for this orderItem
      const alreadyReturnedQty = order.returns.reduce((acc, ret) => {
        const retItem = ret.items.find((ri) => ri.orderItemId === itemInput.orderItemId);
        return acc + (retItem ? retItem.quantity : 0);
      }, 0);

      if (alreadyReturnedQty + itemInput.quantity > orderItem.quantity) {
        throw new Error(
          `Cannot return ${itemInput.quantity} units of "${orderItem.productName}". Max returnable quantity is ${
            orderItem.quantity - alreadyReturnedQty
          }.`
        );
      }
    }

    // 5. Create Return Record in Prisma Transaction
    const returnRecord = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdReturn = await tx.return.create({
        data: {
          orderId: order.id,
          customerId,
          reason: input.reason,
          customerNote: input.customerNote || null,
          status: 'REQUESTED',
          items: {
            create: input.items.map((item) => ({
              orderItemId: item.orderItemId,
              variantId: item.variantId || null,
              quantity: item.quantity,
              reason: item.reason || input.reason,
            })),
          },
        },
        include: {
          items: { include: { orderItem: true } },
          order: true,
        },
      });

      // Log system audit event
      await tx.systemEvent.create({
        data: {
          eventType: 'return.requested',
          payload: JSON.stringify({
            returnId: createdReturn.id,
            orderNumber: order.orderNumber,
            customerId,
          }),
          status: 'PROCESSED',
        },
      });

      return createdReturn;
    });

    // Notify Customer
    await NotificationService.sendNotification({
      customerId,
      type: 'ORDER_STATUS',
      title: `Return Request Received`,
      message: `Your return request for Order #${order.orderNumber} has been received and is under review.`,
      actionUrl: `/account/returns`,
    });

    return returnRecord;
  },

  /**
   * Retrieve all return requests for an authenticated customer
   */
  async getCustomerReturns(customerId: string) {
    try {
      return await prisma.return.findMany({
        where: { customerId },
        include: {
          order: true,
          items: { include: { orderItem: true } },
          refunds: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      return [];
    }
  },

  /**
   * Get single return detail with IDOR protection
   */
  async getReturnById(returnId: string, customerId: string) {
    try {
      const returnReq = await prisma.return.findFirst({
        where: { id: returnId, customerId },
        include: {
          order: { include: { items: true } },
          items: { include: { orderItem: true } },
          refunds: true,
        },
      });
      return returnReq;
    } catch (err) {
      return null;
    }
  },
};
