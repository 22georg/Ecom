'use client';

import React from 'react';
import { Bell, Search, Sun, Moon, ExternalLink, ShieldAlert } from 'lucide-react';
import { ThemeMode } from '@/types';
import { Badge } from '../ui/Badge';

interface AdminTopbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSwitchToStorefront: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  theme,
  onToggleTheme,
  onSwitchToStorefront,
}) => {
  return (
    <header className="h-16 bg-[var(--mq-surface)] border-b border-[var(--mq-border)] px-6 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors duration-200">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--mq-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search orders, SKU, customers..."
            className="w-full h-9 pl-9 pr-4 text-xs rounded-lg bg-[var(--mq-surface-muted)] border border-[var(--mq-border)] text-[var(--mq-text-primary)] placeholder-[var(--mq-text-tertiary)] focus:outline-none focus:border-[var(--mq-secondary)]"
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--mq-success-bg)] text-[var(--mq-success-text)] border border-[var(--mq-success-border)] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[var(--mq-success)] animate-pulse" />
          <span>Railway Prod</span>
        </div>

        {/* View Storefront CTA */}
        <button
          onClick={onSwitchToStorefront}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--mq-surface-muted)] text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-hover)] text-xs font-semibold transition-colors border border-[var(--mq-border)]"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-[var(--mq-secondary)]" />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)] rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--mq-error)] rounded-full" />
        </button>

        {/* Theme Switcher */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)] rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-[var(--mq-border)]">
          <div className="w-8 h-8 rounded-full bg-[var(--mq-primary)] text-white flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-[var(--mq-text-primary)]">Admin Lead</span>
            <span className="text-[10px] text-[var(--mq-text-tertiary)]">admin@marqivo.local</span>
          </div>
        </div>
      </div>
    </header>
  );
};
