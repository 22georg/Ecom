import { prisma } from '@/lib/db';
import { logAdminAction } from '@/services/admin-audit.service';
import { NotificationService } from '@/services/notification.service';

export interface AdminOrderFilterOptions {
  search?: string;
  status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus?: 'UNPAID' | 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  page?: number;
  limit?: number;
}

export interface CreateShipmentInput {
  orderId: string;
  carrier: string; // Pathao, RedX, Steadfast, DHL
  trackingNumber: string;
}

export async function getAdminOrders(options: AdminOrderFilterOptions = {}) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  if (!process.env.DATABASE_URL) {
    return { orders: [], total: 0, page, limit, totalPages: 0 };
  }

  try {
    const where: any = {};

    if (options.status) {
      where.status = options.status;
    }
    if (options.paymentStatus) {
      where.paymentStatus = options.paymentStatus;
    }

    if (options.search && options.search.trim()) {
      const q = options.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { shippingName: { contains: q, mode: 'insensitive' } },
        { guestEmail: { contains: q, mode: 'insensitive' } },
        { customer: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: true,
          shipments: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : o.shippingName,
        customerEmail: o.customer?.email || o.guestEmail,
        status: o.status,
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentStatus,
        itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
        grandTotal: Number(o.grandTotal),
        currency: o.currency,
        shipmentCount: o.shipments.length,
        createdAt: o.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error('Failed to fetch admin orders:', err);
    return { orders: [], total: 0, page, limit, totalPages: 0 };
  }
}

export async function getAdminOrderDetail(orderId: string) {
  if (!process.env.DATABASE_URL) return null;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: true,
        payments: true,
        shipments: true,
        returns: { include: { items: true, refunds: true } },
      },
    });

    if (!order) return null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      currency: order.currency,
      subtotal: Number(order.subtotal),
      discountTotal: Number(order.discountTotal),
      shippingTotal: Number(order.shippingTotal),
      taxTotal: Number(order.taxTotal),
      grandTotal: Number(order.grandTotal),
      customer: order.customer
        ? {
            id: order.customer.id,
            name: `${order.customer.firstName} ${order.customer.lastName}`,
            email: order.customer.email,
            phone: order.customer.phone,
          }
        : null,
      shippingAddress: {
        name: order.shippingName,
        phone: order.shippingPhone,
        address: order.shippingAddress,
        city: order.shippingCity,
        state: order.shippingState,
        postalCode: order.shippingPostalCode,
        country: order.shippingCountry,
      },
      items: order.items.map((i) => ({
        id: i.id,
        variantId: i.variantId,
        productName: i.productName,
        variantTitle: i.variantTitle,
        sku: i.sku,
        imageUrl: i.imageUrl,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount),
        lineTotal: Number(i.lineTotal),
      })),
      payments: order.payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        transactionRef: p.transactionRef,
        amount: Number(p.amount),
        status: p.status,
        createdAt: p.createdAt,
      })),
      shipments: order.shipments.map((s) => ({
        id: s.id,
        carrier: s.carrier,
        trackingNumber: s.trackingNumber,
        status: s.status,
        shippedAt: s.shippedAt,
        deliveredAt: s.deliveredAt,
      })),
      returns: order.returns.map((r) => ({
        id: r.id,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
      })),
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  } catch (err) {
    console.error('Failed to fetch admin order detail:', err);
    return null;
  }
}

export async function updateAdminOrderStatus(
  adminUserId: string,
  orderId: string,
  newStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
) {
  if (!process.env.DATABASE_URL) throw new Error('Database not connected');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new Error('Order not found.');

  if (order.status === newStatus) return order;

  // If status changed to CANCELLED and was not already cancelled, release stock
  if (newStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
    const warehouse = await prisma.warehouse.findFirst();
    if (warehouse) {
      for (const item of order.items) {
        if (item.variantId) {
          await prisma.inventoryItem.updateMany({
            where: { variantId: item.variantId, warehouseId: warehouse.id },
            data: { quantityOnHand: { increment: item.quantity } },
          });

          await prisma.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              warehouseId: warehouse.id,
              movementType: 'RELEASE',
              quantityDelta: item.quantity,
              referenceType: 'ADMIN_ORDER_CANCELLED',
              referenceId: order.id,
              notes: `Order ${order.orderNumber} cancelled by admin`,
            },
          });
        }
      }
    }
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus,
      fulfillmentStatus: newStatus === 'DELIVERED' ? 'FULFILLED' : newStatus === 'SHIPPED' ? 'FULFILLED' : order.fulfillmentStatus,
    },
  });

  // Create customer notification if customer exists
  if (order.customerId) {
    await NotificationService.sendNotification({
      customerId: order.customerId,
      type: 'ORDER_STATUS',
      title: `Order #${order.orderNumber} Status Updated`,
      message: `Your order status has been updated to ${newStatus}.`,
      actionUrl: `/account/orders/${order.orderNumber}`,
    });
  }

  await logAdminAction({
    adminUserId,
    action: 'ORDER_STATUS_UPDATED',
    entityType: 'Order',
    entityId: order.id,
    payload: { orderNumber: order.orderNumber, previousStatus: order.status, newStatus },
  });

  return updatedOrder;
}

export async function createAdminOrderShipment(adminUserId: string, input: CreateShipmentInput) {
  if (!process.env.DATABASE_URL) throw new Error('Database not connected');

  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order) throw new Error('Order not found.');

  const shipment = await prisma.shipment.create({
    data: {
      orderId: input.orderId,
      carrier: input.carrier,
      trackingNumber: input.trackingNumber,
      status: 'FULFILLED',
      shippedAt: new Date(),
    },
  });

  // Update order status to SHIPPED if currently PROCESSING or PENDING
  if (order.status === 'PENDING' || order.status === 'PROCESSING') {
    await prisma.order.update({
      where: { id: input.orderId },
      data: { status: 'SHIPPED', fulfillmentStatus: 'FULFILLED' },
    });
  }

  if (order.customerId) {
    await NotificationService.sendNotification({
      customerId: order.customerId,
      type: 'ORDER_STATUS',
      title: `Shipment Created for Order #${order.orderNumber}`,
      message: `Carrier: ${input.carrier}. Tracking Number: ${input.trackingNumber}`,
      actionUrl: `/account/orders/${order.orderNumber}`,
    });
  }

  await logAdminAction({
    adminUserId,
    action: 'ORDER_SHIPMENT_CREATED',
    entityType: 'Shipment',
    entityId: shipment.id,
    payload: { orderNumber: order.orderNumber, carrier: input.carrier, trackingNumber: input.trackingNumber },
  });

  return shipment;
}
