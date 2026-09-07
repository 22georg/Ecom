import { prisma } from '@/lib/db';

export interface TrackingStep {
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  timestamp?: string | null;
}

export interface OrderTrackingInfo {
  orderNumber: string;
  orderStatus: string;
  fulfillmentStatus: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  estimatedDelivery?: string | null;
  timeline: TrackingStep[];
}

export const TrackingService = {
  /**
   * Calculate shipment status timeline for customer order details
   */
  async getOrderTracking(orderNumber: string): Promise<OrderTrackingInfo | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { shipments: { orderBy: { shippedAt: 'desc' }, take: 1 } },
      });

      if (!order) return null;

      const shipment = order.shipments[0];
      const isCancelled = order.status === 'CANCELLED';

      const timeline: TrackingStep[] = [
        {
          title: 'Order Placed',
          description: 'Your order was received and verified.',
          status: 'completed',
          timestamp: order.createdAt.toISOString(),
        },
        {
          title: 'Order Confirmed',
          description: 'Payment authorization and stock allocation completed.',
          status: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
            ? 'completed'
            : order.status === 'PENDING'
            ? 'current'
            : 'upcoming',
          timestamp: order.createdAt.toISOString(),
        },
        {
          title: 'Processing in Warehouse',
          description: 'Items are being packed and quality-inspected.',
          status: ['SHIPPED', 'DELIVERED'].includes(order.status)
            ? 'completed'
            : order.status === 'PROCESSING'
            ? 'current'
            : 'upcoming',
        },
        {
          title: 'Shipped with Courier',
          description: shipment
            ? `Handed to ${shipment.carrier || 'Express Courier'} (Tracking #${shipment.trackingNumber || 'Pending'})`
            : 'Handed to logistics carrier.',
          status: ['SHIPPED', 'DELIVERED'].includes(order.status)
            ? 'completed'
            : order.status === 'PROCESSING'
            ? 'current'
            : 'upcoming',
          timestamp: shipment?.shippedAt?.toISOString() || null,
        },
        {
          title: 'Delivered',
          description: 'Package delivered to recipient address.',
          status: order.status === 'DELIVERED' ? 'completed' : order.status === 'SHIPPED' ? 'current' : 'upcoming',
          timestamp: shipment?.deliveredAt?.toISOString() || null,
        },
      ];

      // Estimated delivery date: 3 business days from order creation
      const estDate = new Date(order.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);

      return {
        orderNumber: order.orderNumber,
        orderStatus: order.status,
        fulfillmentStatus: order.fulfillmentStatus,
        carrier: shipment?.carrier || 'MARQIVO Express Logistics',
        trackingNumber: shipment?.trackingNumber || `MQV-TRK-${order.orderNumber.split('-').pop()}`,
        shippedAt: shipment?.shippedAt ? shipment.shippedAt.toISOString() : null,
        deliveredAt: shipment?.deliveredAt ? shipment.deliveredAt.toISOString() : null,
        estimatedDelivery: estDate.toISOString().split('T')[0],
        timeline: isCancelled
          ? [
              {
                title: 'Order Cancelled',
                description: 'This order was cancelled and inventory released.',
                status: 'completed',
                timestamp: order.updatedAt.toISOString(),
              },
            ]
          : timeline,
      };
    } catch (err) {
      return null;
    }
  },
};
