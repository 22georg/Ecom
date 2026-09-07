'use client';

import React, { useState } from 'react';
import { X, ChevronRight, User, ShoppingBag, Heart, Search } from 'lucide-react';
import { Button } from '../ui/Button';

interface MobileCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    children?: Array<{ id: string; name: string; slug: string }>;
  }>;
}

export const MobileCategoryDrawer: React.FC<MobileCategoryDrawerProps> = ({
  isOpen,
  onClose,
  categories,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs mq-animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative w-4/5 max-w-sm bg-[var(--mq-surface)] h-full flex flex-col z-10 shadow-2xl mq-animate-fade-in">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[var(--mq-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--mq-secondary)] text-white font-bold flex items-center justify-center text-lg">
              M
            </div>
            <span className="font-display font-extrabold text-xl text-[var(--mq-text-primary)]">MARQIVO</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--mq-text-tertiary)] hover:text-[var(--mq-text-primary)] rounded-md"
            aria-label="Close navigation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 text-sm font-semibold">
          <a
            href="/search"
            onClick={onClose}
            className="px-3 py-2.5 rounded-lg bg-[var(--mq-surface-muted)] text-[var(--mq-secondary)] font-bold flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Explore All Catalog Products</span>
          </a>

          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--mq-text-tertiary)] mt-3 px-3">
            Product Categories
          </div>

          {categories.map((cat) => {
            const hasChildren = cat.children && cat.children.length > 0;
            const isExpanded = expandedId === cat.id;

            return (
              <div key={cat.id} className="flex flex-col">
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--mq-surface-muted)] text-[var(--mq-text-primary)]">
                  <a href={`/category/${cat.slug}`} onClick={onClose} className="flex-1">
                    {cat.name}
                  </a>
                  {hasChildren && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                      className="p-1 text-[var(--mq-text-tertiary)]"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {hasChildren && isExpanded && (
                  <div className="pl-6 flex flex-col gap-1 my-1 border-l-2 border-[var(--mq-border)] ml-3">
                    {cat.children!.map((sub) => (
                      <a
                        key={sub.id}
                        href={`/category/${cat.slug}/${sub.slug}`}
                        onClick={onClose}
                        className="py-1.5 px-3 text-xs text-[var(--mq-text-secondary)] hover:text-[var(--mq-secondary)]"
                      >
                        {sub.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Drawer Footer Account CTA */}
        <div className="p-4 border-t border-[var(--mq-border)] bg-[var(--mq-surface-muted)] flex flex-col gap-2">
          <Button
            variant="primary"
            size="md"
            fullWidth
            leftIcon={<User className="w-4 h-4" />}
            onClick={() => {
              onClose();
              window.location.href = '/account';
            }}
          >
            My Account
          </Button>
        </div>
      </div>
    </div>
  );
};
