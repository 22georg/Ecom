import React from 'react';
import { Star, ShieldCheck, Sparkles } from 'lucide-react';
import { RatingSummary } from '@/services/product-detail.service';

interface ProductSummaryHeaderProps {
  name: string;
  brand?: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  } | null;
  selectedSku?: string;
  ratingSummary: RatingSummary;
  shortDesc?: string | null;
}

export const ProductSummaryHeader: React.FC<ProductSummaryHeaderProps> = ({
  name,
  brand,
  selectedSku,
  ratingSummary,
  shortDesc,
}) => {
  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-[var(--mq-border)]">
      {/* Brand & Verification Badge Row */}
      <div className="flex items-center justify-between gap-4">
        {brand ? (
          <a
            href={`/brand/${brand.slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--mq-secondary)] hover:underline"
          >
            {brand.logoUrl && (
              <img src={brand.logoUrl} alt={brand.name} className="w-4 h-4 object-contain rounded-full" />
            )}
            <span>{brand.name}</span>
          </a>
        ) : (
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--mq-secondary)]">
            MARQIVO Hardware
          </span>
        )}

        {/* Dynamic SKU */}
        {selectedSku && (
          <span className="text-[11px] font-mono text-[var(--mq-text-tertiary)] bg-[var(--mq-surface-muted)] px-2 py-0.5 rounded border border-[var(--mq-border)]">
            SKU: {selectedSku}
          </span>
        )}
      </div>

      {/* Main Heading Title */}
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--mq-text-primary)] leading-tight">
        {name}
      </h1>

      {/* Short Description */}
      {shortDesc && (
        <p className="text-xs sm:text-sm text-[var(--mq-text-secondary)] leading-relaxed">
          {shortDesc}
        </p>
      )}

      {/* Rating Anchor & Verification Signal */}
      <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
        <a href="#reviews" className="flex items-center gap-1.5 group cursor-pointer">
          <div className="flex items-center text-amber-500">
            <Star className="w-4 h-4 fill-current" />
          </div>
          <span className="font-bold text-[var(--mq-text-primary)] group-hover:text-[var(--mq-secondary)] transition-colors">
            {ratingSummary.average > 0 ? ratingSummary.average.toFixed(1) : 'New'}
          </span>
          <span className="text-[var(--mq-text-tertiary)] underline group-hover:text-[var(--mq-secondary)]">
            ({ratingSummary.totalCount} {ratingSummary.totalCount === 1 ? 'review' : 'reviews'})
          </span>
        </a>

        <span className="text-[var(--mq-text-tertiary)]">•</span>

        <div className="inline-flex items-center gap-1 text-[var(--mq-success-text)] font-semibold text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Authenticity Verified</span>
        </div>
      </div>
    </div>
  );
};
