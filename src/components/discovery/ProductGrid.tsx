'use client';

import React from 'react';
import { ProductCard, ProductCardData } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';

export interface ProductGridProps {
  products: ProductCardData[];
  columns?: 2 | 3 | 4;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onClearFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  columns = 4,
  isLoading = false,
  error,
  onRetry,
  emptyTitle = 'No Products Found',
  emptyDescription = 'Try adjusting your search criteria or removing active filters.',
  onClearFilters,
}) => {
  const getGridColClass = (cols: number) => {
    switch (cols) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const gridClass = `grid ${getGridColClass(columns)} gap-6`;

  if (error) {
    return <ErrorState title="Catalog Error" description={error} onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex flex-col gap-3 p-4 border border-[var(--mq-border)] rounded-xl bg-[var(--mq-surface)]">
            <Skeleton variant="rectangular" height={180} />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="85%" />
            <Skeleton variant="text" width="60%" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onClearFilters ? 'Reset Filters' : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className={gridClass}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
};
