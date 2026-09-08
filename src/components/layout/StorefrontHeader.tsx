'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, User, Menu, X, Sparkles, Sun, Moon, ChevronDown, ShieldCheck, UserCheck } from 'lucide-react';
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
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
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
            <a href="/admin/login" className="hover:underline flex items-center gap-1 font-semibold text-amber-300">
              <ShieldCheck className="w-3 h-3" /> Admin Portal
            </a>
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

          {/* Interactive Account & Admin Portal Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--mq-border)] bg-[var(--mq-surface)] hover:bg-[var(--mq-surface-muted)] text-[var(--mq-text-primary)] text-sm font-semibold transition-all duration-200 shadow-xs cursor-pointer"
              aria-expanded={accountDropdownOpen}
              aria-haspopup="true"
            >
              <User className="w-4 h-4 text-[var(--mq-secondary)]" />
              <span className="hidden sm:inline">Account</span>
              <span className="sm:hidden">Sign In</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--mq-text-secondary)] transition-transform duration-200 ${accountDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {accountDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setAccountDropdownOpen(false)}
                />

                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--mq-surface)] border border-[var(--mq-border)] shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-[var(--mq-border)] mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--mq-text-secondary)]">Portal Selection</p>
                    <p className="text-[11px] text-[var(--mq-text-tertiary)]">Select your login destination</p>
                  </div>

                  {/* Customer Portal Option */}
                  <a
                    href="/login"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--mq-surface-muted)] transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform mt-0.5">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--mq-text-primary)] flex items-center gap-1.5">
                        Customer Portal
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">Storefront</span>
                      </div>
                      <p className="text-[11px] text-[var(--mq-text-secondary)] leading-tight mt-0.5">
                        Sign in, register, track orders & profile
                      </p>
                    </div>
                  </a>

                  {/* Admin Portal Option */}
                  <a
                    href="/admin/login"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--mq-surface-muted)] transition-colors group cursor-pointer mt-1"
                  >
                    <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--mq-text-primary)] flex items-center gap-1.5">
                        Admin Portal
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">Console</span>
                      </div>
                      <p className="text-[11px] text-[var(--mq-text-secondary)] leading-tight mt-0.5">
                        Management dashboard for products & orders
                      </p>
                    </div>
                  </a>
                </div>
              </>
            )}
          </div>
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
