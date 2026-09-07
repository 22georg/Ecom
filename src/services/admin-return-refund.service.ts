import { prisma } from '@/lib/db';
import { logAdminAction } from '@/services/admin-audit.service';
import { NotificationService } from '@/services/notification.service';

export async function getAdminReturns(status?: string) {
  if (!process.env.DATABASE_URL) return [];

  try {
    const where: any = {};
    if (status) where.status = status;

    const returns = await prisma.return.findMany({
      where,
      include: {
        customer: true,
        order: true,
        items: { include: { orderItem: true } },
        refunds: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return returns.map((r) => {
      const estimatedRefundAmount = r.items.reduce(
        (sum, item) => sum + Number(item.orderItem.unitPrice) * item.quantity,
        0
      );

      return {
        id: r.id,
        orderId: r.orderId,
        orderNumber: r.order.orderNumber,
        customerName: `${r.customer.firstName} ${r.customer.lastName}`,
        customerEmail: r.customer.email,
        reason: r.reason,
        customerNote: r.customerNote,
        status: r.status,
        itemCount: r.items.reduce((acc, i) => acc + i.quantity, 0),
        estimatedRefundAmount,
        refunds: r.refunds.map((ref) => ({
          id: ref.id,
          amount: Number(ref.amount),
          status: ref.status,
          createdAt: ref.createdAt,
        })),
        createdAt: r.createdAt,
      };
    });
  } catch (err) {
    console.error('Failed to fetch admin returns:', err);
    return [];
  }
}

export async function updateAdminReturnStatus(
  adminUserId: string,
  returnId: string,
  newStatus: 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'COMPLETED'
) {
  if (!process.env.DATABASE_URL) throw new Error('Database not connected');

  const returnReq = await prisma.return.findUnique({
    where: { id: returnId },
    include: { order: true, items: { include: { orderItem: true } } },
  });
  if (!returnReq) throw new Error('Return request not found.');

  const updatedReturn = await prisma.return.update({
    where: { id: returnId },
    data: { status: newStatus },
  });

  // If status COMPLETED, issue refund if not already created
  if (newStatus === 'COMPLETED') {
    const payment = await prisma.payment.findFirst({
      where: { orderId: returnReq.orderId, status: 'PAID' },
    });

    const refundAmount = returnReq.items.reduce(
      (sum, item) => sum + Number(item.orderItem.unitPrice) * item.quantity,
      0
    );

    if (payment && refundAmount > 0) {
      const existingRefund = await prisma.refund.findFirst({
        where: { returnId: returnReq.id },
      });

      if (!existingRefund) {
        await prisma.refund.create({
          data: {
            paymentId: payment.id,
            returnId: returnReq.id,
            amount: refundAmount,
            reason: `Return #${returnReq.id.slice(0, 8)} approved and completed`,
            status: 'COMPLETED',
          },
        });
      }
    }
  }

  // Notify customer
  await NotificationService.sendNotification({
    customerId: returnReq.customerId,
    type: 'ORDER_STATUS',
    title: `Return Request Status Updated`,
    message: `Your return request for Order #${returnReq.order.orderNumber} is now ${newStatus}.`,
    actionUrl: `/account/returns`,
  });

  await logAdminAction({
    adminUserId,
    action: 'RETURN_STATUS_UPDATED',
    entityType: 'Return',
    entityId: returnReq.id,
    payload: { orderNumber: returnReq.order.orderNumber, previousStatus: returnReq.status, newStatus },
  });

  return updatedReturn;
}

export async function getAdminRefunds() {
  if (!process.env.DATABASE_URL) return [];

  try {
    const refunds = await prisma.refund.findMany({
      include: {
        payment: { include: { order: { include: { customer: true } } } },
        returnReq: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return refunds.map((r) => ({
      id: r.id,
      orderNumber: r.payment.order.orderNumber,
      customerName: r.payment.order.customer
        ? `${r.payment.order.customer.firstName} ${r.payment.order.customer.lastName}`
        : r.payment.order.shippingName,
      provider: r.payment.provider,
      amount: Number(r.amount),
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt,
    }));
  } catch (err) {
    console.error('Failed to fetch admin refunds:', err);
    return [];
  }
}
