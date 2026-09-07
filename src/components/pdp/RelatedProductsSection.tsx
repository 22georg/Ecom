import React from 'react';
import { ProductGrid } from '../discovery/ProductGrid';
import { ProductCardData } from '../discovery/ProductCard';
import { Sparkles } from 'lucide-react';

interface RelatedProductsSectionProps {
  products: ProductCardData[];
}

export const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-8 border-t border-[var(--mq-border)] mt-8">
      <div className="flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--mq-secondary)] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Complementary Gear</span>
          </div>
          <h3 className="text-2xl font-display font-extrabold text-[var(--mq-text-primary)]">
            Related Products & Accessories
          </h3>
        </div>

        <ProductGrid products={products} columns={4} />
      </div>
    </section>
  );
};
