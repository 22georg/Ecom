'use client';

import React, { useState } from 'react';
import { X, Filter, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { FilterSidebar, FilterState } from './FilterSidebar';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface MobileFilterDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  totalResults?: number;
  availableBrands?: Array<{ id: string; name: string; slug: string }>;
  brands?: Array<{ id: string; name: string; slug: string }>;
  availableSubcategories?: Array<{ id: string; name: string; slug: string }>;
  subcategories?: Array<{ id: string; name: string; slug: string }>;
  currentCategorySlug?: string;
  categorySlug?: string;
  filterState?: FilterState;
  onFilterChange?: (newState: FilterState) => void;
  onClearAll?: () => void;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = (props) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isDrawerOpen = props.isOpen !== undefined ? props.isOpen : internalOpen;
  const handleClose = props.onClose || (() => setInternalOpen(false));

  const brandsList = props.brands || props.availableBrands || [];
  const subcategoriesList = props.subcategories || props.availableSubcategories || [];
  const activeCategorySlug = props.categorySlug || props.currentCategorySlug;

  const handleClearAll = () => {
    if (props.onClearAll) {
      props.onClearAll();
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('brand');
      params.delete('minPrice');
      params.delete('maxPrice');
      params.delete('rating');
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <>
      {/* Self-contained Trigger button if not controlled externally */}
      {props.isOpen === undefined && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInternalOpen(true)}
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
        >
          Filters
        </Button>
      )}

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs mq-animate-fade-in"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-[var(--mq-surface)] h-full flex flex-col z-10 shadow-2xl mq-animate-fade-in ml-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[var(--mq-border)] flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[var(--mq-text-primary)]">
                <Filter className="w-4 h-4 text-[var(--mq-secondary)]" />
                <span>Filter Products</span>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 text-[var(--mq-text-tertiary)] hover:text-[var(--mq-text-primary)] rounded-md cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Filter Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <FilterSidebar
                brands={brandsList}
                subcategories={subcategoriesList}
                categorySlug={activeCategorySlug}
                filterState={props.filterState}
                onFilterChange={props.onFilterChange}
                onClearAll={props.onClearAll}
              />
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-[var(--mq-border)] bg-[var(--mq-surface-muted)] flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleClearAll} className="shrink-0">
                Reset
              </Button>
              <Button variant="primary" size="md" fullWidth onClick={handleClose}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
