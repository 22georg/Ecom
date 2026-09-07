'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface SortSelectProps {
  currentSort: string;
}

export function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.delete('page'); // Reset to page 1 on sort change
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      name="sort"
      value={currentSort}
      onChange={handleChange}
      className="h-9 px-3 text-xs rounded-md bg-[var(--mq-surface-card)] border border-[var(--mq-border)] text-[var(--mq-text-primary)] focus:outline-none focus:border-[var(--mq-secondary)] cursor-pointer"
    >
      <option value="featured">Featured Picks</option>
      <option value="newest">Newest Arrivals</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="rating">Customer Rating</option>
    </select>
  );
}
