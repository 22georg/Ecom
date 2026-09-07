'use client';

import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { X, RefreshCw } from 'lucide-react';
import { FilterState } from './FilterSidebar';

export interface ActiveFilterChipsProps {
  availableBrands?: Array<{ id: string; name: string; slug: string }>;
  brands?: Array<{ id: string; name: string; slug: string }>;
  filterState?: FilterState;
  onFilterChange?: (newState: FilterState) => void;
  onClearAll?: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = (props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const brandsList = props.brands || props.availableBrands || [];
  const brandNameMap = new Map(brandsList.map((b) => [b.slug, b.name]));

  // Read active state from URL params if filterState is omitted
  const activeBrandSlugs = props.filterState?.brandSlugs ||
    (searchParams.get('brand') ? searchParams.get('brand')!.split(',').filter(Boolean) : []);

  const minPrice = props.filterState?.minPrice !== undefined
    ? props.filterState.minPrice
    : (searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined);

  const maxPrice = props.filterState?.maxPrice !== undefined
    ? props.filterState.maxPrice
    : (searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined);

  const activeRating = props.filterState?.rating !== undefined
    ? props.filterState.rating
    : (searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined);

  const removeParam = (keys: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    keys.forEach((k) => params.delete(k));
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateParam = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeChips: Array<{ id: string; label: string; onRemove: () => void }> = [];

  // Active Brand chips
  activeBrandSlugs.forEach((slug) => {
    activeChips.push({
      id: `brand-${slug}`,
      label: `Brand: ${brandNameMap.get(slug) || slug}`,
      onRemove: () => {
        if (props.onFilterChange && props.filterState) {
          const updated = props.filterState.brandSlugs.filter((b) => b !== slug);
          props.onFilterChange({ ...props.filterState, brandSlugs: updated });
        } else {
          const updated = activeBrandSlugs.filter((b) => b !== slug);
          updateParam('brand', updated.join(','));
        }
      },
    });
  });

  // Price range chips
  if (minPrice !== undefined || maxPrice !== undefined) {
    const minStr = minPrice !== undefined ? `$${minPrice}` : '$0';
    const maxStr = maxPrice !== undefined ? `$${maxPrice}` : 'Any';
    activeChips.push({
      id: 'price-range',
      label: `Price: ${minStr} - ${maxStr}`,
      onRemove: () => {
        if (props.onFilterChange && props.filterState) {
          props.onFilterChange({ ...props.filterState, minPrice: undefined, maxPrice: undefined });
        } else {
          removeParam(['minPrice', 'maxPrice']);
        }
      },
    });
  }

  // Rating chip
  if (activeRating) {
    activeChips.push({
      id: 'rating-chip',
      label: `Rating: ${activeRating}+ Stars`,
      onRemove: () => {
        if (props.onFilterChange && props.filterState) {
          props.onFilterChange({ ...props.filterState, rating: undefined });
        } else {
          removeParam(['rating']);
        }
      },
    });
  }

  const handleClearAll = () => {
    if (props.onClearAll) {
      props.onClearAll();
    } else {
      removeParam(['brand', 'minPrice', 'maxPrice', 'rating', 'page']);
    }
  };

  if (activeChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs font-bold text-[var(--mq-text-tertiary)] uppercase tracking-wider mr-1">
        Active Filters:
      </span>

      {activeChips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--mq-secondary-light)] text-[var(--mq-secondary)] border border-[var(--mq-secondary)]/30 text-xs font-semibold"
        >
          <span>{chip.label}</span>
          <button
            onClick={chip.onRemove}
            className="hover:text-[var(--mq-primary)] p-0.5 rounded transition-colors cursor-pointer"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={handleClearAll}
        className="text-xs text-[var(--mq-secondary)] font-bold hover:underline ml-2 flex items-center gap-1 cursor-pointer"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
};
