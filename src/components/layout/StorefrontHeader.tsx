'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, User, Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { HeaderSearch } from '../discovery/HeaderSearch';
import { MegaMenu } from '../discovery/MegaMenu';
import { MobileCategoryDrawer } from '../discovery/MobileCategoryDrawer';
import { CartDrawer } from '../cart/CartDrawer';
import { useCart } from '@/context/CartContext';
import { ThemeMode } from '@/types';

interface StorefrontHeaderProps {
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
}

export const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({
  theme = 'light',
  onToggleTheme = () => {},
  cartCount,
  wishlistCount = 0,
  onOpenCart,
}) => {
  const { itemCount, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const activeCartCount = cartCount !== undefined ? cartCount : itemCount;
  const handleCartClick = onOpenCart || openDrawer;

  useEffect(() => {
    fetch('/api/catalog/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--mq-surface)] border-b border-[var(--mq-border)] transition-colors duration-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[var(--mq-primary)] text-white text-xs py-2 px-4 flex items-center justify-between font-medium">
        <div className="mq-container flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--mq-accent)] animate-pulse" />
            <span>Discover MARQIVO 2.0 — Complimentary global express shipping over ৳5,000</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] opacity-80">
            <a href="#" className="hover:underline">Track Order</a>
            <span>•</span>
            <a href="/wishlist" className="hover:underline">Wishlist</a>
            <span>•</span>
            <a href="#" className="hover:underline">Support 24/7</a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="mq-container py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Mobile Menu Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)] rounded-md"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[var(--mq-secondary)] text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-2xl tracking-tight text-[var(--mq-text-primary)] leading-none">
                MARQIVO
              </span>
              <span className="text-[10px] font-semibold text-[var(--mq-secondary)] tracking-wider uppercase mt-0.5">
                Connected Commerce
              </span>
            </div>
          </a>
        </div>

        {/* Global Search Bar with Autocomplete */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <HeaderSearch />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)] rounded-full transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Wishlist Button */}
          <a
            href="/wishlist"
            className="relative p-2 text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)] rounded-full transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--mq-accent)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </a>

          {/* Cart Icon Indicator */}
          <button
            onClick={handleCartClick}
            className="relative p-2 text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)] rounded-full transition-colors cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {activeCartCount > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-[var(--mq-secondary)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {activeCartCount}
              </span>
            )}
          </button>

          {/* Customer Account CTA */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<User className="w-4 h-4 hidden sm:inline-block" />}
            onClick={() => (window.location.href = '/account')}
          >
            <span className="hidden sm:inline">Account</span>
            <span className="sm:hidden">Sign In</span>
          </Button>
        </div>
      </div>

      {/* Desktop Category Navigation & Mega-Menu */}
      <div className="hidden md:block border-t border-[var(--mq-border)] bg-[var(--mq-surface-muted)]/40">
        <MegaMenu />
      </div>

      {/* Mobile Slide-Out Category Navigation Drawer */}
      <MobileCategoryDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />
    </header>
  );
};
