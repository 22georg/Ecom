'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface SimpleProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  mediaUrl?: string;
  categoryName?: string;
}

export const RecentlyViewedTracker: React.FC<{ currentProduct: SimpleProduct }> = ({
  currentProduct,
}) => {
  const [history, setHistory] = useState<SimpleProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mq_recently_viewed');
      let items: SimpleProduct[] = stored ? JSON.parse(stored) : [];

      // Filter out current product to avoid duplicates
      items = items.filter((p) => p.slug !== currentProduct.slug);

      // Prepend current product
      const updated = [currentProduct, ...items].slice(0, 8);

      localStorage.setItem('mq_recently_viewed', JSON.stringify(updated));

      // Display previous items
      setHistory(items);
    } catch (err) {
      // Graceful fallback for SSR or restricted browser storage
    }
  }, [currentProduct]);

  if (history.length === 0) return null;

  return (
    <section className="py-8 border-t border-[var(--mq-border)] mt-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--mq-secondary)]" />
          <h4 className="font-bold text-sm text-[var(--mq-text-primary)]">Recently Viewed Hardware</h4>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-3 scrollbar-none">
          {history.map((item) => (
            <a
              key={item.id}
              href={`/product/${item.slug}`}
              className="group flex items-center gap-3 p-2.5 rounded-xl bg-[var(--mq-surface-card)] border border-[var(--mq-border)] hover:border-[var(--mq-secondary)] transition-all shrink-0 w-64 shadow-xs"
            >
              <div className="w-14 h-14 rounded-lg bg-[var(--mq-surface-muted)] overflow-hidden shrink-0 flex items-center justify-center">
                {item.mediaUrl ? (
                  <img src={item.mediaUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <span className="font-bold text-xs text-[var(--mq-secondary)]">{item.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-bold uppercase text-[var(--mq-secondary)] truncate">
                  {item.categoryName || 'MARQIVO'}
                </span>
                <span className="text-xs font-bold text-[var(--mq-text-primary)] truncate group-hover:text-[var(--mq-secondary)] transition-colors">
                  {item.name}
                </span>
                <span className="text-xs font-bold text-[var(--mq-text-primary)] mt-0.5">
                  ৳{item.price.toLocaleString()}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
