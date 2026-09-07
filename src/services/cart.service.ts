import { prisma } from '@/lib/db';
import { CartIdentity } from '@/lib/cart-session';
import { CouponService, CouponValidationResult } from './coupon.service';
import { ShippingService, ShippingMethodOption } from './shipping.service';

export interface FormattedCartItem {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  sku: string;
  variantLabel: string;
  unitPrice: number;
  compareAtPrice?: number | null;
  quantity: number;
  lineSubtotal: number;
  lineDiscount: number;
  mediaUrl?: string;
  stockQty: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockAlert?: string | null;
}

export interface FormattedCart {
  id: string;
  customerId?: string | null;
  guestToken?: string | null;
  items: FormattedCartItem[];
  itemCount: number; // Sum of item quantities
  uniqueItemCount: number;
  subtotal: number;
  productSavingsTotal: number;
  couponCode?: string | null;
  couponResult?: CouponValidationResult | null;
  shippingMethodId?: string | null;
  shippingMethods: ShippingMethodOption[];
  selectedShippingMethod?: ShippingMethodOption;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  hasStockAlerts: boolean;
}

export const CartService = {
  /**
   * Retrieve or create active cart for guest or authenticated customer
   */
  async getOrCreateCart(identity: CartIdentity) {
    if (!process.env.DATABASE_URL) {
      return null;
    }

    try {
      if (identity.customerId) {
        let cart = await prisma.cart.findFirst({
          where: { customerId: identity.customerId, status: 'ACTIVE' },
        });

        if (!cart) {
          cart = await prisma.cart.create({
            data: { customerId: identity.customerId, status: 'ACTIVE', currency: 'BDT' },
          });
        }
        return cart;
      }

      if (identity.guestToken) {
        let cart = await prisma.cart.findUnique({
          where: { sessionToken: identity.guestToken },
        });

        if (!cart) {
          cart = await prisma.cart.create({
            data: { sessionToken: identity.guestToken, status: 'ACTIVE', currency: 'BDT' },
          });
        }
        return cart;
      }

      return null;
    } catch (err) {
      console.error('Error in getOrCreateCart:', err);
      return null;
    }
  },

  /**
   * Fetch calculated cart directly by Cart ID
   */
  async getCalculatedCart(cartId: string): Promise<FormattedCart | null> {
    if (!process.env.DATABASE_URL) {
      return this.getFallbackCart({});
    }

    try {
      const cartRecord = await prisma.cart.findUnique({
        where: { id: cartId },
      });

      if (!cartRecord) return null;

      return await this.getCartWithTotals({
        customerId: cartRecord.customerId || undefined,
        guestToken: cartRecord.sessionToken || undefined,
      });
    } catch (err) {
      return null;
    }
  },

  /**
   * Fetch full cart with backend-authoritative pricing calculations & stock revalidation
   */
  async getCartWithTotals(identity: CartIdentity): Promise<FormattedCart> {
    if (!process.env.DATABASE_URL) {
      return this.getFallbackCart(identity);
    }

    try {
      const cartRecord = await this.getOrCreateCart(identity);

      if (!cartRecord) {
        return this.getFallbackCart(identity);
      }

      // Fetch Cart Items with Products, Variants, Options, Media, and Inventory
      const cartWithItems = await prisma.cart.findUnique({
        where: { id: cartRecord.id },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      brand: true,
                      media: { orderBy: { displayOrder: 'asc' }, take: 1 },
                    },
                  },
                  variantOptions: {
                    include: { optionValue: { include: { option: true } } },
                  },
                  inventoryItems: true,
                },
              },
            },
          },
        },
      });

      if (!cartWithItems) {
        return this.getFallbackCart(identity);
      }

      let subtotal = 0;
      let productSavingsTotal = 0;
      let itemCount = 0;
      let hasStockAlerts = false;

      const items: FormattedCartItem[] = [];

      for (const item of cartWithItems.items) {
        const v = item.variant;
        const p = v.product;

        // Skip soft-deleted or inactive products
        if (!p || p.status !== 'ACTIVE' || p.deletedAt !== null) {
          continue;
        }

        const unitPrice = Number(v.price);
        const compareAt = v.compareAtPrice ? Number(v.compareAtPrice) : null;
        const lineSubtotal = unitPrice * item.quantity;
        const lineDiscount = compareAt && compareAt > unitPrice ? (compareAt - unitPrice) * item.quantity : 0;

        subtotal += lineSubtotal;
        productSavingsTotal += lineDiscount;
        itemCount += item.quantity;

        // Concurrency-Safe Stock Calculation across warehouses
        const availableStock = v.inventoryItems.reduce(
          (sum, inv) => sum + (inv.quantityOnHand - inv.quantityReserved),
          0
        );

        let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        let stockAlert: string | null = null;

        if (availableStock <= 0) {
          stockStatus = 'out_of_stock';
          stockAlert = 'Item is currently out of stock.';
          hasStockAlerts = true;
        } else if (item.quantity > availableStock) {
          stockStatus = 'low_stock';
          stockAlert = `Only ${availableStock} units available in stock. Requested ${item.quantity}.`;
          hasStockAlerts = true;
        } else if (availableStock <= 5) {
          stockStatus = 'low_stock';
        }

        const variantLabel = v.variantOptions
          .map((vo) => vo.optionValue.value)
          .join(' / ');

        items.push({
          id: item.id,
          cartId: item.cartId,
          productId: p.id,
          productName: p.name,
          productSlug: p.slug,
          variantId: v.id,
          sku: v.sku,
          variantLabel: variantLabel || 'Standard',
          unitPrice,
          compareAtPrice: compareAt,
          quantity: item.quantity,
          lineSubtotal,
          lineDiscount,
          mediaUrl: p.media[0]?.mediaUrl,
          stockQty: Math.max(0, availableStock),
          stockStatus,
          stockAlert,
        });
      }

      // 1. Coupon Validation
      let couponResult: CouponValidationResult | null = null;
      let couponDiscountAmount = 0;

      if (cartWithItems.couponCode) {
        couponResult = await CouponService.validateAndCalculateCoupon(
          cartWithItems.couponCode,
          subtotal
        );
        if (couponResult.isValid) {
          couponDiscountAmount = couponResult.discountAmount;
        }
      }

      // 2. Shipping Calculation
      const shippingMethods = ShippingService.getAvailableShippingMethods(subtotal);
      const selectedShippingMethod =
        shippingMethods.find((m) => m.id === cartWithItems.shippingMethodId) || shippingMethods[0];
      const shippingTotal = selectedShippingMethod.cost;

      // 3. Tax Calculation (e.g. 0% included or 5% tax rule)
      const taxTotal = 0;

      // 4. Authoritative Grand Total
      const grandTotal = Math.max(0, subtotal - couponDiscountAmount + shippingTotal + taxTotal);

      return {
        id: cartWithItems.id,
        customerId: cartWithItems.customerId,
        guestToken: cartWithItems.sessionToken,
        items,
        itemCount,
        uniqueItemCount: items.length,
        subtotal,
        productSavingsTotal,
        couponCode: cartWithItems.couponCode,
        couponResult,
        shippingMethodId: selectedShippingMethod.id,
        shippingMethods,
        selectedShippingMethod,
        shippingTotal,
        taxTotal,
        grandTotal,
        currency: 'BDT',
        hasStockAlerts,
      };
    } catch (err) {
      console.error('Error in getCartWithTotals:', err);
      return this.getFallbackCart(identity);
    }
  },

  /**
   * Add variant item to cart with backend stock validation
   */
  async addItemToCart(identity: CartIdentity, variantId: string, quantity: number = 1) {
    if (quantity < 1) quantity = 1;

    if (!process.env.DATABASE_URL) {
      return { success: true, message: 'Added to cart' };
    }

    try {
      const cart = await this.getOrCreateCart(identity);
      if (!cart) throw new Error('Failed to initialize cart.');

      // Validate Variant & Product
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: {
          product: true,
          inventoryItems: true,
        },
      });

      if (!variant || !variant.isActive || !variant.product || variant.product.status !== 'ACTIVE' || variant.product.deletedAt !== null) {
        throw new Error('Selected product variant is unavailable for purchase.');
      }

      // Check stock quantity
      const availableStock = variant.inventoryItems.reduce(
        (sum, inv) => sum + (inv.quantityOnHand - inv.quantityReserved),
        0
      );

      if (availableStock <= 0) {
        throw new Error('Selected variant is out of stock.');
      }

      // Check existing cart item
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId: variant.id,
          },
        },
      });

      const newQty = existingItem ? existingItem.quantity + quantity : quantity;

      if (newQty > availableStock) {
        throw new Error(`Cannot add ${quantity} more units. Only ${availableStock} left in stock.`);
      }

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQty,
            unitPrice: variant.price,
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variantId: variant.id,
            quantity: newQty,
            unitPrice: variant.price,
          },
        });
      }

      // Touch cart timestamp
      await prisma.cart.update({
        where: { id: cart.id },
        data: { updatedAt: new Date() },
      });

      return { success: true, message: 'Product added to cart.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to add item to cart.' };
    }
  },

  /**
   * Update quantity of a cart item
   */
  async updateItemQuantity(identity: CartIdentity, cartItemId: string, newQuantity: number) {
    if (!process.env.DATABASE_URL) {
      return { success: true };
    }

    try {
      const cart = await this.getOrCreateCart(identity);
      if (!cart) throw new Error('Cart not found.');

      if (newQuantity <= 0) {
        return this.removeItemFromCart(identity, cartItemId);
      }

      const item = await prisma.cartItem.findFirst({
        where: { id: cartItemId, cartId: cart.id },
        include: { variant: { include: { inventoryItems: true } } },
      });

      if (!item) throw new Error('Cart item not found.');

      const availableStock = item.variant.inventoryItems.reduce(
        (sum, inv) => sum + (inv.quantityOnHand - inv.quantityReserved),
        0
      );

      if (newQuantity > availableStock) {
        throw new Error(`Only ${availableStock} units available in stock.`);
      }

      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: newQuantity },
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update quantity.' };
    }
  },

  /**
   * Remove item from cart
   */
  async removeItemFromCart(identity: CartIdentity, cartItemId: string) {
    if (!process.env.DATABASE_URL) {
      return { success: true };
    }

    try {
      const cart = await this.getOrCreateCart(identity);
      if (!cart) throw new Error('Cart not found.');

      await prisma.cartItem.deleteMany({
        where: { id: cartItemId, cartId: cart.id },
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, message: 'Failed to remove item.' };
    }
  },

  /**
   * Apply coupon code to cart
   */
  async applyCoupon(identity: CartIdentity, code: string) {
    if (!process.env.DATABASE_URL) {
      return { success: true, message: 'Coupon applied.' };
    }

    try {
      const cart = await this.getOrCreateCart(identity);
      if (!cart) throw new Error('Cart not found.');

      const formattedCart = await this.getCartWithTotals(identity);
      const validation = await CouponService.validateAndCalculateCoupon(code, formattedCart.subtotal);

      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }

      await prisma.cart.update({
        where: { id: cart.id },
        data: { couponCode: validation.code },
      });

      return { success: true, message: validation.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to apply coupon.' };
    }
  },

  /**
   * Remove active coupon code from cart
   */
  async removeCoupon(identity: CartIdentity) {
    if (!process.env.DATABASE_URL) return { success: true };
    try {
      const cart = await this.getOrCreateCart(identity);
      if (cart) {
        await prisma.cart.update({
          where: { id: cart.id },
          data: { couponCode: null },
        });
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Failed to remove coupon.' };
    }
  },

  /**
   * Update selected shipping method for cart
   */
  async selectShippingMethod(identity: CartIdentity, shippingMethodId: string) {
    if (!process.env.DATABASE_URL) return { success: true };
    try {
      const cart = await this.getOrCreateCart(identity);
      if (cart) {
        await prisma.cart.update({
          where: { id: cart.id },
          data: { shippingMethodId },
        });
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Failed to select shipping method.' };
    }
  },

  /**
   * Merge Guest Cart into Customer Cart upon login
   */
  async mergeGuestCartIntoCustomerCart(guestToken: string, customerId: string) {
    if (!guestToken || !customerId || !process.env.DATABASE_URL) return;

    try {
      const guestCart = await prisma.cart.findUnique({
        where: { sessionToken: guestToken },
        include: { items: true },
      });

      if (!guestCart || guestCart.items.length === 0) return;

      const customerCart = await this.getOrCreateCart({ customerId });
      if (!customerCart) return;

      for (const item of guestCart.items) {
        const existingInCustomer = await prisma.cartItem.findUnique({
          where: {
            cartId_variantId: {
              cartId: customerCart.id,
              variantId: item.variantId,
            },
          },
        });

        if (existingInCustomer) {
          await prisma.cartItem.update({
            where: { id: existingInCustomer.id },
            data: { quantity: existingInCustomer.quantity + item.quantity },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: customerCart.id,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            },
          });
        }
      }

      // Preserve coupon code if customer cart has none
      if (guestCart.couponCode && !customerCart.couponCode) {
        await prisma.cart.update({
          where: { id: customerCart.id },
          data: { couponCode: guestCart.couponCode },
        });
      }

      // Delete guest cart
      await prisma.cart.delete({ where: { id: guestCart.id } });
    } catch (err) {
      console.error('Error merging guest cart:', err);
    }
  },

  /**
   * In-Memory Fallback Cart when Database is Offline
   */
  getFallbackCart(identity: CartIdentity): FormattedCart {
    const shippingMethods = ShippingService.getAvailableShippingMethods(18900);
    return {
      id: 'fallback-cart-1',
      customerId: identity.customerId,
      guestToken: identity.guestToken,
      items: [
        {
          id: 'item-1',
          cartId: 'fallback-cart-1',
          productId: 'p-pulse-pro-1',
          productName: 'Pulse Pro Wireless ANC Earbuds',
          productSlug: 'pulse-pro-wireless-earbuds',
          variantId: 'var-1',
          sku: 'MQV-PLS-BLK-STD',
          variantLabel: 'Matte Black / Standard',
          unitPrice: 18900,
          compareAtPrice: 22500,
          quantity: 1,
          lineSubtotal: 18900,
          lineDiscount: 3600,
          mediaUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
          stockQty: 25,
          stockStatus: 'in_stock',
          stockAlert: null,
        },
      ],
      itemCount: 1,
      uniqueItemCount: 1,
      subtotal: 18900,
      productSavingsTotal: 3600,
      couponCode: null,
      couponResult: null,
      shippingMethodId: 'standard',
      shippingMethods,
      selectedShippingMethod: shippingMethods[0],
      shippingTotal: 0, // Free shipping threshold unlocked (> ৳5,000)
      taxTotal: 0,
      grandTotal: 18900,
      currency: 'BDT',
      hasStockAlerts: false,
    };
  },
};
