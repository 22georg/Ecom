import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { CartService } from './cart.service';
import { PaymentService } from './payment/payment.service';

export interface CreateOrderInput {
  cartId: string;
  customerId?: string;
  guestEmail?: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  billingName?: string;
  billingAddress?: string;
  notes?: string;
  paymentProvider: string;
}

export const OrderService = {
  /**
   * Generate human-readable unique Order Number (Format: MQV-YYYY-XXXXXX)
   */
  generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    return `MQV-${year}-${randomSeq}`;
  },

  /**
   * Execute atomic order creation transaction
   */
  async placeOrder(input: CreateOrderInput) {
    // 1. Fetch & Recalculate Cart
    const cart = await CartService.getCalculatedCart(input.cartId);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Shopping cart is empty or no longer valid.');
    }

    // 2. Prepare Guest Token if guest purchase
    const isGuest = !input.customerId;
    const guestToken = isGuest ? crypto.randomBytes(32).toString('hex') : null;
    const orderNumber = this.generateOrderNumber();

    // 3. Initiate Payment with selected adapter
    const paymentAdapter = PaymentService.getAdapter(input.paymentProvider);
    const paymentInitResult = await paymentAdapter.initiatePayment({
      orderNumber,
      amount: cart.grandTotal,
      currency: cart.currency,
      customerName: input.shippingName,
      customerEmail: input.guestEmail || '',
      customerPhone: input.shippingPhone,
    });

    // 4. Atomic Prisma Transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      const couponDiscount = cart.couponResult?.isValid ? cart.couponResult.discountAmount : 0;

      // A. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: input.customerId || null,
          guestEmail: input.guestEmail || null,
          guestToken: guestToken || null,
          status: 'PENDING',
          paymentStatus: input.paymentProvider.toUpperCase() === 'COD' ? 'PENDING' : 'PENDING',
          fulfillmentStatus: 'UNFULFILLED',
          currency: cart.currency,
          subtotal: new Prisma.Decimal(cart.subtotal),
          discountTotal: new Prisma.Decimal(couponDiscount + cart.productSavingsTotal),
          shippingTotal: new Prisma.Decimal(cart.shippingTotal),
          taxTotal: new Prisma.Decimal(cart.taxTotal),
          grandTotal: new Prisma.Decimal(cart.grandTotal),

          // Address Snapshots
          shippingName: input.shippingName,
          shippingPhone: input.shippingPhone,
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity || null,
          shippingState: input.shippingState || null,
          shippingPostalCode: input.shippingPostalCode || null,
          shippingCountry: input.shippingCountry || 'BD',
          billingName: input.billingName || input.shippingName,
          billingAddress: input.billingAddress || input.shippingAddress,
          notes: input.notes || null,

          // Order Items Snapshot
          items: {
            create: cart.items.map((item: any) => ({
              variantId: item.variantId,
              productName: item.productName,
              variantTitle: item.variantLabel,
              sku: item.sku,
              imageUrl: item.mediaUrl || null,
              quantity: item.quantity,
              unitPrice: new Prisma.Decimal(item.unitPrice),
              discount: new Prisma.Decimal(item.lineDiscount),
              lineTotal: new Prisma.Decimal(item.lineSubtotal),
            })),
          },

          // Payment Snapshot
          payments: {
            create: {
              provider: paymentAdapter.providerCode,
              transactionRef: paymentInitResult.transactionRef,
              amount: new Prisma.Decimal(cart.grandTotal),
              currency: cart.currency,
              status: 'PENDING',
              payload: JSON.stringify(paymentInitResult.payload || {}),
            },
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // B. Deduct Inventory Stock & Record Movement
      for (const item of cart.items) {
        // Find warehouse inventory item
        const invItem = await tx.inventoryItem.findFirst({
          where: { variantId: item.variantId },
        });

        if (invItem) {
          await tx.inventoryItem.update({
            where: { id: invItem.id },
            data: {
              quantityOnHand: {
                decrement: item.quantity,
              },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              warehouseId: invItem.warehouseId,
              movementType: 'OUTBOUND',
              quantityDelta: -item.quantity,
              referenceType: 'ORDER',
              referenceId: order.id,
              notes: `Stock allocated for Order #${orderNumber}`,
            },
          });
        }
      }

      // C. Increment Coupon Usage if applicable
      if (cart.couponCode) {
        await tx.coupon.updateMany({
          where: { code: cart.couponCode },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      // D. Mark Cart as CONVERTED
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          status: 'CONVERTED',
        },
      });

      // E. Log System Event
      await tx.systemEvent.create({
        data: {
          eventType: 'order.created',
          payload: JSON.stringify({
            orderId: order.id,
            orderNumber: order.orderNumber,
            grandTotal: cart.grandTotal,
            paymentProvider: paymentAdapter.providerCode,
          }),
          status: 'PROCESSED',
        },
      });

      // F. Create Customer Notification if authenticated
      if (input.customerId) {
        await tx.notification.create({
          data: {
            customerId: input.customerId,
            type: 'ORDER_STATUS',
            title: `Order #${orderNumber} Confirmed`,
            message: `Your order of ৳${cart.grandTotal.toLocaleString()} has been placed successfully.`,
          },
        });
      }

      return order;
    });

    return {
      order: createdOrder,
      guestToken,
      redirectUrl: paymentInitResult.redirectUrl,
    };
  },

  /**
   * Retrieve order by number with optional security check
   */
  async getOrderByNumber(orderNumber: string, accessCheck?: { customerId?: string; guestToken?: string }) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          customer: true,
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      media: true,
                    },
                  },
                },
              },
            },
          },
          payments: true,
          shipments: true,
        },
      });

      if (!order) return null;

      // Access verification
      if (accessCheck) {
        if (order.customerId) {
          if (accessCheck.customerId !== order.customerId) {
            return null; // IDOR Protection: Not owner
          }
        } else if (order.guestToken) {
          if (accessCheck.guestToken !== order.guestToken) {
            return null; // Guest Token mismatch
          }
        }
      }

      return order;
    } catch (err) {
      return null;
    }
  },
};
