import { prisma } from '@/lib/db';

export const RefundService = {
  /**
   * Retrieve refund history for an authenticated customer
   */
  async getCustomerRefunds(customerId: string) {
    try {
      const refunds = await prisma.refund.findMany({
        where: {
          payment: {
            order: { customerId },
          },
        },
        include: {
          payment: {
            include: {
              order: true,
            },
          },
          returnReq: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return refunds.map((r) => ({
        id: r.id,
        orderNumber: r.payment.order.orderNumber,
        amount: Number(r.amount),
        currency: r.payment.currency,
        status: r.status,
        reason: r.reason || 'Return Refund',
        paymentProvider: r.payment.provider,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (err) {
      return [];
    }
  },
};
