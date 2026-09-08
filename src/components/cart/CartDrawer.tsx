'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { X, ShoppingBag, ArrowRight, Truck, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { CartItemRow } from './CartItemRow';
import { FREE_SHIPPING_THRESHOLD } from '@/services/shipping.service';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    itemCount,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    selectShippingMethod,
  } = useCart();

  if (!isDrawerOpen) return null;

  const subtotal = cart?.subtotal || 0;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const formatCurrency = (val: number) => `৳${Math.round(val).toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs mq-animate-fade-in"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-md bg-[var(--mq-surface)] h-full flex flex-col z-10 shadow-2xl mq-animate-fade-in border-l border-[var(--mq-border)]">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--mq-border)] flex items-center justify-between bg-[var(--mq-surface-card)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--mq-secondary-light)] text-[var(--mq-secondary)]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-[var(--mq-text-primary)]">
                Shopping Cart
              </h3>
              <span className="text-xs font-semibold text-[var(--mq-text-tertiary)]">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} selected
              </span>
            </div>
          </div>

          <button
            onClick={closeDrawer}
            className="p-2 text-[var(--mq-text-tertiary)] hover:text-[var(--mq-text-primary)] rounded-lg hover:bg-[var(--mq-surface-muted)] transition-colors cursor-pointer"
            aria-label="Close Shopping Cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-5 py-3 bg-[var(--mq-surface-muted)]/60 border-b border-[var(--mq-border)] text-xs">
          {remainingForFreeShipping > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[var(--mq-secondary)]" /> Add{' '}
                  <strong className="font-bold text-[var(--mq-secondary)]">
                    {formatCurrency(remainingForFreeShipping)}
                  </strong>{' '}
                  for FREE Shipping
                </span>
                <span className="font-bold">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--mq-border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--mq-secondary)] rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <Truck className="w-4 h-4" />
              <span>Complimentary Express Shipping Unlocked!</span>
            </div>
          )}
        </div>

        {/* Scrollable Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart && cart.items.length > 0 ? (
            cart.items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                isCompact
              />
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--mq-text-tertiary)]">
              <ShoppingBag className="w-12 h-12 mb-3 text-slate-300" />
              <h4 className="font-bold text-sm text-[var(--mq-text-primary)]">Your Cart is Empty</h4>
              <p className="text-xs max-w-xs mt-1 mb-6">Explore our connected hardware catalog to add items.</p>
              <a href="/search" onClick={closeDrawer}>
                <Button variant="outline" size="sm">
                  Browse Catalog
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Drawer Footer Summary */}
        {cart && cart.items.length > 0 && (
          <div className="p-5 border-t border-[var(--mq-border)] bg-[var(--mq-surface-card)] space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--mq-text-secondary)]">Subtotal</span>
              <span className="mq-price font-display font-extrabold text-lg text-[var(--mq-text-primary)]">
                {formatCurrency(cart.subtotal)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a href="/cart" onClick={closeDrawer} className="w-full">
                <Button variant="outline" size="md" fullWidth>
                  View Full Cart
                </Button>
              </a>

              <a href="/checkout" onClick={closeDrawer} className="w-full">
                <Button variant="secondary" size="md" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Checkout
                </Button>
              </a>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--mq-text-tertiary)] font-medium">
              <Lock className="w-3 h-3 text-[var(--mq-secondary)]" />
              <span>Encrypted 256-bit SSL Transaction Security</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
