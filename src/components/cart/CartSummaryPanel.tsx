'use client';

import React from 'react';
import { FormattedCart } from '@/services/cart.service';
import { CouponInputBox } from './CouponInputBox';
import { Button } from '../ui/Button';
import { ArrowRight, ShieldCheck, Truck, Lock } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface CartSummaryPanelProps {
  cart: FormattedCart;
  onApplyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  onRemoveCoupon: () => Promise<boolean>;
  onSelectShippingMethod: (id: string) => Promise<boolean>;
  onProceedToCheckout?: () => void;
}

export const CartSummaryPanel: React.FC<CartSummaryPanelProps> = ({
  cart,
  onApplyCoupon,
  onRemoveCoupon,
  onSelectShippingMethod,
  onProceedToCheckout,
}) => {
  const { addToast } = useToast();

  const formatCurrency = (val: number) => `৳${Math.round(val).toLocaleString()}`;

  const handleCheckoutClick = () => {
    if (cart.items.length === 0) return;
    if (cart.hasStockAlerts) {
      addToast({
        type: 'warning',
        title: 'Stock Warning',
        description: 'Please resolve items with stock alerts before proceeding to checkout.',
      });
      return;
    }

    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else {
      addToast({
        type: 'info',
        title: 'Proceeding to Checkout (Prompt 7 Ready)',
        description: `Preparing order for ${formatCurrency(cart.grandTotal)}.`,
      });
    }
  };

  return (
    <div className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] p-6 rounded-2xl shadow-sm flex flex-col gap-5 sticky top-24 select-none">
      <h3 className="font-display font-extrabold text-lg text-[var(--mq-text-primary)] pb-3 border-b border-[var(--mq-border)]">
        Order Summary
      </h3>

      {/* Breakdown Rows */}
      <div className="flex flex-col gap-2.5 text-xs">
        {/* Cart Subtotal */}
        <div className="flex items-center justify-between text-[var(--mq-text-secondary)] font-medium">
          <span>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-bold text-[var(--mq-text-primary)]">{formatCurrency(cart.subtotal)}</span>
        </div>

        {/* Product Compare-At Savings */}
        {cart.productSavingsTotal > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Product Catalog Discounts</span>
            <span>−{formatCurrency(cart.productSavingsTotal)}</span>
          </div>
        )}

        {/* Coupon Discount */}
        {cart.couponResult && cart.couponResult.isValid && cart.couponResult.discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span>Promo Coupon ({cart.couponCode})</span>
            <span>−{formatCurrency(cart.couponResult.discountAmount)}</span>
          </div>
        )}

        {/* Shipping Method Selector */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--mq-border)]/60">
          <span className="font-bold uppercase tracking-wider text-[var(--mq-text-tertiary)] text-[10px]">
            Shipping Method
          </span>
          <div className="flex flex-col gap-1.5">
            {cart.shippingMethods.map((method) => {
              const isSelected = cart.shippingMethodId === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => onSelectShippingMethod(method.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--mq-secondary)] bg-[var(--mq-surface-muted)] text-[var(--mq-text-primary)] font-semibold'
                      : 'border-[var(--mq-border)] text-[var(--mq-text-secondary)] hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold">{method.name}</span>
                    <span className="text-[10px] text-[var(--mq-text-tertiary)]">{method.estimatedDays}</span>
                  </div>
                  <span className="font-bold">
                    {method.cost === 0 ? 'FREE' : formatCurrency(method.cost)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between text-[var(--mq-text-tertiary)] text-[11px]">
          <span>VAT & Tax (Included)</span>
          <span>{formatCurrency(cart.taxTotal)}</span>
        </div>
      </div>

      {/* Coupon Form Input */}
      <CouponInputBox
        activeCouponCode={cart.couponCode}
        onApplyCoupon={onApplyCoupon}
        onRemoveCoupon={onRemoveCoupon}
      />

      {/* Grand Total Bar */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-[var(--mq-border)]">
        <div>
          <span className="font-display font-extrabold text-sm text-[var(--mq-text-primary)] block">
            Grand Total
          </span>
          <span className="text-[10px] text-[var(--mq-text-tertiary)]">All Bangladesh taxes included</span>
        </div>
        <span className="mq-price text-2xl font-display font-extrabold text-[var(--mq-secondary)]">
          {formatCurrency(cart.grandTotal)}
        </span>
      </div>

      {/* Checkout CTA */}
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        disabled={cart.items.length === 0 || cart.hasStockAlerts}
        onClick={handleCheckoutClick}
        rightIcon={<ArrowRight className="w-5 h-5" />}
        className="font-bold"
      >
        Proceed to Checkout
      </Button>

      {/* Trust & Guarantee Signals */}
      <div className="flex items-center justify-around text-[10px] text-[var(--mq-text-tertiary)] font-medium pt-1">
        <div className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-[var(--mq-secondary)]" />
          <span>256-bit SSL</span>
        </div>
        <div className="flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-[var(--mq-secondary)]" />
          <span>Express Courier</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--mq-secondary)]" />
          <span>MARQIVO Guarantee</span>
        </div>
      </div>
    </div>
  );
};
