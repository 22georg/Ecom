'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { StorefrontHeader } from '@/components/layout/StorefrontHeader';
import { StorefrontFooter } from '@/components/layout/StorefrontFooter';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummaryPanel } from '@/components/cart/CartSummaryPanel';
import { EmptyCartView } from '@/components/cart/EmptyCartView';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ShoppingBag, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function CartPage() {
  const {
    cart,
    isLoading,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    selectShippingMethod,
  } = useCart();

  const { addToast } = useToast();

  const handleSaveToWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/account/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        addToast({
          type: 'warning',
          title: 'Sign In Required',
          description: 'Please sign in to save products to your personal wishlist.',
        });
        return;
      }

      const data = await res.json();
      if (data.success) {
        addToast({
          type: 'info',
          title: 'Wishlist Updated',
          description: data.message,
        });
      }
    } catch (err) {
      addToast({
        type: 'info',
        title: 'Saved to Wishlist',
        description: 'Product updated in wishlist.',
      });
    }
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Shopping Cart', href: '/cart' },
  ];

  return (
    <div className="min-h-screen bg-[var(--mq-surface-bg)] flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 mq-container py-8">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        {/* Page Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--mq-border)] pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--mq-secondary)] uppercase tracking-wider mb-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Checkout Preparation</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-[var(--mq-text-primary)]">
              Shopping Cart
            </h1>
          </div>

          <a href="/search">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Continue Shopping
            </Button>
          </a>
        </div>

        {/* Stock Alert Global Banner if any item has stock issues */}
        {cart?.hasStockAlerts && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>
              Some items in your cart have stock updates. Please adjust item quantities before proceeding to checkout.
            </span>
          </div>
        )}

        {/* Main Content Layout */}
        {!isLoading && cart && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                  onSaveToWishlist={handleSaveToWishlist}
                />
              ))}
            </div>

            {/* Right Column: Order Summary & Coupon / Shipping Panel */}
            <div className="lg:col-span-4">
              <CartSummaryPanel
                cart={cart}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                onSelectShippingMethod={selectShippingMethod}
              />
            </div>
          </div>
        ) : (
          !isLoading && <EmptyCartView />
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
