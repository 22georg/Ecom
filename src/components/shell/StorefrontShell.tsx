'use client';

import React, { useState } from 'react';
import { StorefrontHeader } from '../layout/StorefrontHeader';
import { StorefrontFooter } from '../layout/StorefrontFooter';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ThemeMode, DemoProduct } from '@/types';
import { useToast } from '../ui/Toast';
import { ShoppingBag, Heart, Star, Sparkles, Filter, ArrowRight } from 'lucide-react';

interface StorefrontShellProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const StorefrontShell: React.FC<StorefrontShellProps> = ({ theme, onToggleTheme }) => {
  const { addToast } = useToast();
  const [cartCount, setCartCount] = useState(2);
  const [wishlistCount, setWishlistCount] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const products: DemoProduct[] = [
    {
      id: 'MQ-001',
      name: 'Aura Connected Sensor Node',
      category: 'Smart Hardware',
      price: 149.0,
      originalPrice: 189.0,
      rating: 4.8,
      reviewCount: 42,
      stockStatus: 'in_stock',
      badge: 'NEW RELEASE',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
    },
    {
      id: 'MQ-002',
      name: 'Kinetic Ergonomic Stand',
      category: 'Workspace',
      price: 129.0,
      rating: 4.9,
      reviewCount: 96,
      stockStatus: 'in_stock',
      badge: 'BESTSELLER',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
    },
    {
      id: 'MQ-003',
      name: 'Pulse Modular Wireless Audio',
      category: 'Audio Architecture',
      price: 229.0,
      originalPrice: 279.0,
      rating: 4.7,
      reviewCount: 64,
      stockStatus: 'low_stock',
      badge: 'PROMO 18% OFF',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df',
    },
    {
      id: 'MQ-004',
      name: 'Cipher Hardened Key Manager',
      category: 'Security Hardware',
      price: 349.0,
      rating: 4.9,
      reviewCount: 28,
      stockStatus: 'in_stock',
      imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147',
    },
    {
      id: 'MQ-005',
      name: 'Velo Minimalist Commuter Pack',
      category: 'Carry & Apparel',
      price: 189.0,
      rating: 4.6,
      reviewCount: 31,
      stockStatus: 'in_stock',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    },
    {
      id: 'MQ-006',
      name: 'Lumina Intelligent Desk Lamp',
      category: 'Smart Hardware',
      price: 199.0,
      originalPrice: 239.0,
      rating: 4.8,
      reviewCount: 53,
      stockStatus: 'low_stock',
      badge: 'LIMITED',
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
    },
  ];

  const handleAddToCart = (p: DemoProduct) => {
    setCartCount((c) => c + 1);
    addToast({
      type: 'success',
      title: 'Added to Cart',
      description: `${p.name} ($${p.price.toFixed(2)}) reserved in cart session.`,
    });
  };

  const handleToggleWishlist = (p: DemoProduct) => {
    setWishlistCount((w) => w + 1);
    addToast({
      type: 'info',
      title: 'Saved to Wishlist',
      description: `${p.name} added to customer wishlist.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--mq-background)] transition-colors duration-200">
      {/* Header */}
      <StorefrontHeader
        theme={theme}
        onToggleTheme={onToggleTheme}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onOpenCart={() =>
          addToast({
            type: 'info',
            title: 'Cart Drawer',
            description: `${cartCount} items currently in cart session.`,
          })
        }
      />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[var(--mq-primary)] to-slate-950 text-white py-16 md:py-24 border-b border-[var(--mq-border)]">
        <div className="mq-container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--mq-secondary)]/20 border border-[var(--mq-secondary)]/40 text-[var(--mq-secondary-light)] text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[var(--mq-accent)]" />
              <span>MARQIVO 1.0 Platform Release</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
              Modern commerce, <br />
              <span className="text-[var(--mq-secondary-light)]">intelligently connected.</span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-lg leading-relaxed">
              Experience an original discovery-driven storefront engineered for instant decision making, transparent checkout, and real-time inventory management.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="secondary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={() =>
                  addToast({
                    type: 'success',
                    title: 'Discovery Pipeline Engaged',
                  })
                }
              >
                Explore Featured Catalog
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Platform Architecture
              </Button>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-md p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Badge variant="warning">FEATURED DROPS</Badge>
                <span className="text-xs text-slate-300 font-mono">LIVE STOCK</span>
              </div>
              <div className="p-4 rounded-xl bg-white/10 border border-white/10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-[var(--mq-secondary)] text-white font-bold flex items-center justify-center text-xl shrink-0">
                  MQ
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-sm text-white">Aura Connected Sensor</span>
                  <span className="text-xs text-slate-300 mt-0.5">Automated telemetry & alert engine</span>
                  <span className="mq-price text-sm text-[var(--mq-secondary-light)] font-bold mt-1">$149.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog & Discovery Section */}
      <main className="mq-container py-12 flex-1 flex flex-col gap-8">
        {/* Discovery Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--mq-surface)] p-4 rounded-xl border border-[var(--mq-border)] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--mq-text-primary)]">
            <Filter className="w-4 h-4 text-[var(--mq-secondary)]" />
            <span>Discover Products ({products.length})</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Select
              options={[
                { label: 'All Categories', value: 'all' },
                { label: 'Smart Hardware', value: 'hardware' },
                { label: 'Audio Architecture', value: 'audio' },
                { label: 'Workspace', value: 'workspace' },
              ]}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              selectSize="sm"
              containerClassName="w-36"
            />
            <Select
              options={[
                { label: 'Sort: Featured', value: 'featured' },
                { label: 'Price: Low to High', value: 'price_asc' },
                { label: 'Price: High to Low', value: 'price_desc' },
                { label: 'Highest Rated', value: 'rating' },
              ]}
              selectSize="sm"
              containerClassName="w-40"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card key={p.id} variant="interactive" className="group flex flex-col justify-between">
              <div>
                {/* Product Image & Badges Overlay */}
                <div className="relative aspect-4/3 w-full bg-[var(--mq-surface-muted)] overflow-hidden flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--mq-primary)] text-white font-bold text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    {p.name.charAt(0)}
                  </div>
                  {p.badge && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="warning" size="sm">{p.badge}</Badge>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWishlist(p);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-black/60 text-[var(--mq-text-secondary)] hover:text-[var(--mq-error)] transition-colors"
                    aria-label="Save to Wishlist"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-5 flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--mq-secondary)]">
                    {p.category}
                  </span>
                  <h3 className="font-bold text-base text-[var(--mq-text-primary)] group-hover:text-[var(--mq-secondary)] transition-colors leading-snug">
                    {p.name}
                  </h3>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-xs text-[var(--mq-text-secondary)] mt-1">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="font-bold text-[var(--mq-text-primary)]">{p.rating}</span>
                    <span className="text-[var(--mq-text-tertiary)]">({p.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart Footer */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-[var(--mq-border)] mt-4">
                <div className="flex flex-col pt-3">
                  <div className="flex items-center gap-2">
                    <span className="mq-price text-lg text-[var(--mq-text-primary)]">${p.price.toFixed(2)}</span>
                    {p.originalPrice && (
                      <span className="text-xs text-[var(--mq-text-tertiary)] line-through">
                        ${p.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--mq-success-text)] font-semibold">In Stock • Ships Today</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                  onClick={() => handleAddToCart(p)}
                >
                  Add
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <StorefrontFooter />
    </div>
  );
};
