'use client';

import React, { useEffect, useState } from 'react';
import { StorefrontHeader } from '@/components/layout/StorefrontHeader';
import { StorefrontFooter } from '@/components/layout/StorefrontFooter';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Heart, ShoppingBag, Trash2, ArrowRight, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';

interface SavedProduct {
  wishlistItemId: string;
  productId: string;
  name: string;
  slug: string;
  brandName?: string;
  price: number;
  mediaUrl?: string;
  addedAt: string;
}

export default function WishlistPage() {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [wishlist, setWishlist] = useState<SavedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/account/wishlist');
      if (res.status === 401) {
        setIsUnauthenticated(true);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      if (data.wishlist) setWishlist(data.wishlist);
    } catch (err) {
      console.warn('Failed to load wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/account/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (data.success) {
        setWishlist((prev) => prev.filter((item) => item.productId !== productId));
        addToast({
          type: 'info',
          title: 'Removed from Wishlist',
          description: 'Product removed from your saved items.',
        });
      }
    } catch (err) {
      setWishlist((prev) => prev.filter((item) => item.productId !== productId));
    }
  };

  const handleMoveToCart = async (item: SavedProduct) => {
    // Attempt to add default product to cart
    // Fetch product details to get first variant ID if needed
    try {
      const res = await fetch(`/api/catalog/products/${item.slug}`);
      const data = await res.json();
      if (data.product && data.product.variants[0]) {
        const variantId = data.product.variants[0].id;
        const success = await addToCart(variantId, 1);
        if (success) {
          await handleRemoveFromWishlist(item.productId);
        }
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to move product to cart.',
      });
    }
  };

  const formatCurrency = (val: number) => `৳${val.toLocaleString()}`;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'My Saved Wishlist', href: '/wishlist' },
  ];

  return (
    <div className="min-h-screen bg-[var(--mq-surface-bg)] flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 mq-container py-8">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--mq-border)] pb-6 mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Saved Catalog Items</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-[var(--mq-text-primary)]">
              Customer Wishlist
            </h1>
          </div>
          <span className="text-xs text-[var(--mq-text-tertiary)]">
            {wishlist.length} {wishlist.length === 1 ? 'saved item' : 'saved items'}
          </span>
        </div>

        {/* Guest Unauthenticated Prompt State */}
        {isUnauthenticated ? (
          <div className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] rounded-2xl p-12 text-center flex flex-col items-center justify-center my-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[var(--mq-text-primary)]">Sign In to Access Your Wishlist</h3>
            <p className="text-xs text-[var(--mq-text-tertiary)] max-w-sm mt-1 mb-6">
              Sign in to your MARQIVO customer account to view and synchronize your saved products across devices.
            </p>
            <a href="/login?returnTo=/wishlist">
              <Button variant="secondary" size="md">
                Sign In to Account
              </Button>
            </a>
          </div>
        ) : !isLoading && wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.wishlistItemId}
                className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] rounded-xl overflow-hidden flex flex-col justify-between group shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className="relative aspect-4/3 w-full bg-[var(--mq-surface-muted)] overflow-hidden flex items-center justify-center border-b border-[var(--mq-border)]">
                    {item.mediaUrl ? (
                      <img
                        src={item.mediaUrl}
                        alt={item.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="font-bold text-xl text-[var(--mq-secondary)]">{item.name.charAt(0)}</span>
                    )}

                    <button
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-black/60 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col gap-1.5">
                    {item.brandName && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--mq-secondary)]">
                        {item.brandName}
                      </span>
                    )}
                    <a href={`/product/${item.slug}`} className="group-hover:text-[var(--mq-secondary)] transition-colors">
                      <h4 className="font-bold text-sm text-[var(--mq-text-primary)] leading-snug line-clamp-2">
                        {item.name}
                      </h4>
                    </a>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-[var(--mq-border)] mt-3 flex items-center justify-between">
                  <span className="mq-price text-base font-bold text-[var(--mq-text-primary)] pt-3">
                    {formatCurrency(item.price)}
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleMoveToCart(item)}
                    leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                  >
                    Move to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] rounded-2xl p-12 text-center flex flex-col items-center justify-center my-8 shadow-xs">
              <Heart className="w-12 h-12 text-red-400 mb-3 opacity-50" />
              <h3 className="text-xl font-bold text-[var(--mq-text-primary)]">Your Wishlist is Empty</h3>
              <p className="text-xs text-[var(--mq-text-tertiary)] max-w-sm mt-1 mb-6">
                Click the heart icon on any product card or product detail page to save items to your personal wishlist.
              </p>
              <a href="/search">
                <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Browse Catalog
                </Button>
              </a>
            </div>
          )
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
