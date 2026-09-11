'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, ShieldCheck, Tag, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { FormattedCart } from '@/services/cart.service';
import { useCart } from '@/context/CartContext';

interface Props {
  cart: FormattedCart | null;
  submitting: boolean;
  notes: string;
  onNotesChange: (val: string) => void;
  onSubmitOrder: () => void;
}

export const CheckoutSummaryPanel: React.FC<Props> = ({
  cart,
  submitting,
  notes,
  onNotesChange,
  onSubmitOrder,
}) => {
  const { applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!cart) return null;

  const couponDiscount = cart.couponResult?.isValid ? cart.couponResult.discountAmount : 0;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);

    const res = await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    if (res.success) {
      setCouponMessage({ type: 'success', text: res.message || 'Coupon applied successfully!' });
      setCouponCode('');
    } else {
      setCouponMessage({ type: 'error', text: res.message || 'Invalid coupon code.' });
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponLoading(true);
    setCouponMessage(null);
    await removeCoupon();
    setCouponLoading(false);
  };

  return (
    <div className="bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-2xl p-6 shadow-sm sticky top-24">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--mq-border)]">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[var(--mq-primary)]" />
          <h3 className="font-bold text-lg text-[var(--mq-text-primary)]">Order Summary</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--mq-primary-light)] text-[var(--mq-primary)]">
          {cart.itemCount} {cart.itemCount === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Item List */}
      <div className="max-h-60 overflow-y-auto pr-1 space-y-3 mb-4 custom-scrollbar">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-3 py-2 border-b border-[var(--mq-border)]/50 last:border-0">
            <div className="relative w-12 h-12 rounded-lg bg-[var(--mq-background)] border border-[var(--mq-border)] overflow-hidden shrink-0">
              {item.mediaUrl ? (
                <Image
                  src={item.mediaUrl}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[var(--mq-text-muted)]">
                  IMG
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-[var(--mq-text-primary)] truncate">{item.productName}</h4>
              <p className="text-[11px] text-[var(--mq-text-muted)] truncate">{item.variantLabel}</p>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-[var(--mq-text-muted)]">Qty: {item.quantity}</span>
                <span className="font-bold text-[var(--mq-text-primary)]">৳{item.lineSubtotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo / Coupon Code Input Section */}
      <div className="mb-4 pt-3 border-t border-[var(--mq-border)]">
        <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-1.5 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[var(--mq-primary)]" />
          <span>Have a Promo / Coupon Code?</span>
        </label>

        {cart.couponCode && cart.couponResult?.isValid ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-emerald-500 uppercase tracking-wider">{cart.couponCode}</p>
                <p className="text-[10px] text-[var(--mq-text-muted)]">
                  Discount: -৳{cart.couponResult.discountAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={couponLoading}
              onClick={handleRemoveCoupon}
              className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Remove Coupon"
            >
              {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="ENTER COUPON (e.g. WELCOME1000)"
              className="flex-1 px-3 py-2 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-xs uppercase font-mono text-[var(--mq-text-primary)] focus:outline-none focus:border-[var(--mq-primary)]"
            />
            <button
              type="submit"
              disabled={couponLoading || !couponCode.trim()}
              className="px-4 py-2 bg-[var(--mq-primary)] hover:bg-[var(--mq-primary-dark)] text-white text-xs font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center min-w-[70px]"
            >
              {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : 'Apply'}
            </button>
          </form>
        )}

        {couponMessage && (
          <div
            className={`mt-2 p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
              couponMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {couponMessage.type === 'success' ? (
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{couponMessage.text}</span>
          </div>
        )}
      </div>

      {/* Special Delivery Notes */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-1">
          Special Delivery Instructions (Optional)
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="e.g. Leave with gate guard if unreachable"
          className="w-full px-3 py-1.5 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-xs text-[var(--mq-text-primary)] focus:outline-none focus:border-[var(--mq-primary)]"
        />
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-2 py-3 border-t border-b border-[var(--mq-border)] text-xs">
        <div className="flex justify-between text-[var(--mq-text-primary)]">
          <span className="text-[var(--mq-text-muted)]">Subtotal</span>
          <span>৳{cart.subtotal.toLocaleString()}</span>
        </div>

        {cart.productSavingsTotal > 0 && (
          <div className="flex justify-between text-[var(--mq-accent-emerald)] font-medium">
            <span>Product Discount</span>
            <span>-৳{cart.productSavingsTotal.toLocaleString()}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between text-[var(--mq-accent-emerald)] font-medium">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" /> Coupon ({cart.couponCode})
            </span>
            <span>-৳{couponDiscount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-[var(--mq-text-primary)]">
          <span className="text-[var(--mq-text-muted)]">Shipping</span>
          <span>{cart.shippingTotal === 0 ? 'FREE' : `৳${cart.shippingTotal.toLocaleString()}`}</span>
        </div>

        {cart.taxTotal > 0 && (
          <div className="flex justify-between text-[var(--mq-text-primary)]">
            <span className="text-[var(--mq-text-muted)]">Estimated Tax</span>
            <span>৳{cart.taxTotal.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="flex justify-between items-baseline my-4">
        <div>
          <span className="text-sm font-bold text-[var(--mq-text-primary)]">Total Amount</span>
          <p className="text-[10px] text-[var(--mq-text-muted)]">Includes all applicable taxes</p>
        </div>
        <span className="text-2xl font-black text-[var(--mq-primary)]">৳{cart.grandTotal.toLocaleString()}</span>
      </div>

      {/* Place Order CTA Button */}
      <button
        type="button"
        disabled={submitting}
        onClick={onSubmitOrder}
        className="w-full py-3.5 px-4 bg-[var(--mq-primary)] hover:bg-[var(--mq-primary-dark)] text-white font-bold rounded-xl transition shadow-lg shadow-[var(--mq-primary)]/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing Order...
          </>
        ) : (
          <>
            Place Order Now
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="mt-4 pt-3 text-center">
        <p className="text-[11px] text-[var(--mq-text-muted)] flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--mq-accent-emerald)]" />
          30-Day MARQIVO Guarantee & Money Back Assurance
        </p>
      </div>
    </div>
  );
};
