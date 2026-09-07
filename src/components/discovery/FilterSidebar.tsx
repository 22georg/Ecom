'use client';

import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Checkbox } from '../ui/Checkbox';
import { Input } from '../ui/Input';
import { Filter, Star, RefreshCw } from 'lucide-react';

export interface FilterState {
  categorySlug?: string;
  subCategorySlug?: string;
  brandSlugs: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort: string;
}

export interface FilterSidebarProps {
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

export const FilterSidebar: React.FC<FilterSidebarProps> = (props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const brandsList = props.brands || props.availableBrands || [];
  const subcategoriesList = props.subcategories || props.availableSubcategories || [];
  const activeCategorySlug = props.categorySlug || props.currentCategorySlug;

  // Active state from URL if prop is not provided
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

  const updateUrlParam = (key: string, value?: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }
    // Reset to page 1 when changing filters
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBrandToggle = (slug: string) => {
    const exists = activeBrandSlugs.includes(slug);
    const updatedBrands = exists
      ? activeBrandSlugs.filter((b) => b !== slug)
      : [...activeBrandSlugs, slug];

    if (props.onFilterChange && props.filterState) {
      props.onFilterChange({ ...props.filterState, brandSlugs: updatedBrands });
    } else {
      updateUrlParam('brand', updatedBrands.join(','));
    }
  };

  const handleRatingSelect = (ratingVal: number) => {
    const newRating = activeRating === ratingVal ? undefined : ratingVal;
    if (props.onFilterChange && props.filterState) {
      props.onFilterChange({ ...props.filterState, rating: newRating });
    } else {
      updateUrlParam('rating', newRating);
    }
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const num = value ? Number(value) : undefined;
    if (props.onFilterChange && props.filterState) {
      props.onFilterChange({ ...props.filterState, [field]: num });
    } else {
      updateUrlParam(field, num);
    }
  };

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
    <aside className="w-full flex flex-col gap-6 text-xs select-none">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--mq-border)]">
        <div className="flex items-center gap-2 font-bold text-sm text-[var(--mq-text-primary)]">
          <Filter className="w-4 h-4 text-[var(--mq-secondary)]" />
          <span>Filter Catalog</span>
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs text-[var(--mq-secondary)] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Subcategories Facet */}
      {subcategoriesList.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-bold text-xs uppercase tracking-wider text-[var(--mq-text-tertiary)]">
            Subcategories
          </span>
          <div className="flex flex-col gap-1">
            {subcategoriesList.map((sub) => (
              <a
                key={sub.id}
                href={`/category/${activeCategorySlug}/${sub.slug}`}
                className="px-2.5 py-1.5 rounded-md hover:bg-[var(--mq-surface-muted)] text-[var(--mq-text-primary)] font-semibold transition-colors flex items-center justify-between"
              >
                <span>{sub.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Brand Multi-Select Facet */}
      {brandsList.length > 0 && (
        <div className="flex flex-col gap-2 pt-3 border-t border-[var(--mq-border)]">
          <span className="font-bold text-xs uppercase tracking-wider text-[var(--mq-text-tertiary)]">
            Brands
          </span>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {brandsList.map((brand) => {
              const isChecked = activeBrandSlugs.includes(brand.slug);
              return (
                <Checkbox
                  key={brand.id}
                  label={brand.name}
                  checked={isChecked}
                  onChange={() => handleBrandToggle(brand.slug)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Facet */}
      <div className="flex flex-col gap-2 pt-3 border-t border-[var(--mq-border)]">
        <span className="font-bold text-xs uppercase tracking-wider text-[var(--mq-text-tertiary)]">
          Price Range ($)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Min Price"
            type="number"
            value={minPrice !== undefined ? minPrice : ''}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            inputSize="sm"
          />
          <Input
            placeholder="Max Price"
            type="number"
            value={maxPrice !== undefined ? maxPrice : ''}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            inputSize="sm"
          />
        </div>
      </div>

      {/* Minimum Rating Facet */}
      <div className="flex flex-col gap-2 pt-3 border-t border-[var(--mq-border)]">
        <span className="font-bold text-xs uppercase tracking-wider text-[var(--mq-text-tertiary)]">
          Minimum Rating
        </span>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2, 1].map((r) => {
            const isSelected = activeRating === r;
            return (
              <button
                key={r}
                onClick={() => handleRatingSelect(r)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--mq-surface-muted)] text-[var(--mq-secondary)] border border-[var(--mq-secondary)]'
                    : 'text-[var(--mq-text-secondary)] hover:bg-[var(--mq-surface-muted)]'
                }`}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: r }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-xs">& Up</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
