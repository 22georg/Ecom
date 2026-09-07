import { prisma } from '@/lib/db';

export interface CouponValidationResult {
  isValid: boolean;
  code: string;
  discountType?: 'FIXED' | 'PERCENTAGE';
  discountValue?: number;
  discountAmount: number;
  minOrderValue?: number;
  message: string;
}

export const CouponService = {
  /**
   * Validate coupon code and calculate applicable discount amount against subtotal
   */
  async validateAndCalculateCoupon(
    code: string,
    subtotal: number
  ): Promise<CouponValidationResult> {
    if (!code || !code.trim()) {
      return { isValid: false, code: '', discountAmount: 0, message: 'Coupon code is required.' };
    }

    const cleanCode = code.trim().toUpperCase();

    if (!process.env.DATABASE_URL) {
      return this.getFallbackCouponResult(cleanCode, subtotal);
    }

    try {
      const coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });

      if (!coupon || !coupon.isActive) {
        return {
          isValid: false,
          code: cleanCode,
          discountAmount: 0,
          message: 'Invalid or expired promo code.',
        };
      }

      const now = new Date();
      if (coupon.startsAt && now < coupon.startsAt) {
        return { isValid: false, code: cleanCode, discountAmount: 0, message: 'Promo code is not active yet.' };
      }

      if (coupon.expiresAt && now > coupon.expiresAt) {
        return { isValid: false, code: cleanCode, discountAmount: 0, message: 'Promo code has expired.' };
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { isValid: false, code: cleanCode, discountAmount: 0, message: 'Promo code redemption limit reached.' };
      }

      const minOrderVal = Number(coupon.minOrderValue || 0);
      if (subtotal < minOrderVal) {
        return {
          isValid: false,
          code: cleanCode,
          discountAmount: 0,
          minOrderValue: minOrderVal,
          message: `Minimum subtotal of ৳${minOrderVal.toLocaleString()} required for promo code ${cleanCode}.`,
        };
      }

      // Calculate discount amount
      let discountAmount = 0;
      const rawVal = Number(coupon.discountValue);

      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (subtotal * rawVal) / 100;
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
        }
      } else {
        // FIXED BDT Amount
        discountAmount = Math.min(subtotal, rawVal);
      }

      return {
        isValid: true,
        code: cleanCode,
        discountType: coupon.discountType as any,
        discountValue: rawVal,
        discountAmount: Math.round(discountAmount),
        message: `Promo code ${cleanCode} applied successfully!`,
      };
    } catch (err) {
      return this.getFallbackCouponResult(cleanCode, subtotal);
    }
  },

  /**
   * In-Memory Fallback validation for demo promo codes when database is offline
   */
  getFallbackCouponResult(code: string, subtotal: number): CouponValidationResult {
    const clean = code.toUpperCase();
    if (clean === 'MARQIVO10') {
      const discount = Math.round((subtotal * 10) / 100);
      return {
        isValid: true,
        code: 'MARQIVO10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        discountAmount: discount,
        message: '10% MARQIVO Launch discount applied!',
      };
    }

    if (clean === 'WELCOME1000') {
      if (subtotal < 10000) {
        return {
          isValid: false,
          code: 'WELCOME1000',
          discountAmount: 0,
          minOrderValue: 10000,
          message: 'Minimum order subtotal of ৳10,000 required for WELCOME1000.',
        };
      }
      return {
        isValid: true,
        code: 'WELCOME1000',
        discountType: 'FIXED',
        discountValue: 1000,
        discountAmount: 1000,
        message: '৳1,000 Welcome discount applied!',
      };
    }

    return {
      isValid: false,
      code: clean,
      discountAmount: 0,
      message: `Promo code "${clean}" is not recognized. Try MARQIVO10 or WELCOME1000.`,
    };
  },
};
