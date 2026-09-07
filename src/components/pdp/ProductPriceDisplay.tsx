import React from 'react';
import { Badge } from '../ui/Badge';

interface ProductPriceDisplayProps {
  price: number;
  compareAtPrice?: number | null;
  hasPriceRange?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export const ProductPriceDisplay: React.FC<ProductPriceDisplayProps> = ({
  price,
  compareAtPrice,
  hasPriceRange = false,
  minPrice = 0,
  maxPrice = 0,
}) => {
  // Format BDT Currency cleanly
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(val)
      .replace('BDT', '৳');
  };

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-1 py-3">
      {hasPriceRange ? (
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase font-bold text-[var(--mq-text-tertiary)]">From</span>
          <span className="mq-price text-2xl sm:text-3xl font-display font-extrabold text-[var(--mq-text-primary)]">
            {formatCurrency(minPrice)} – {formatCurrency(maxPrice)}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          {/* Main Selected Price */}
          <span className="mq-price text-2xl sm:text-3xl font-display font-extrabold text-[var(--mq-text-primary)]">
            {formatCurrency(price)}
          </span>

          {/* Strikethrough Compare-At Price */}
          {hasDiscount && (
            <span className="text-sm sm:text-base text-[var(--mq-text-tertiary)] line-through font-semibold">
              {formatCurrency(compareAtPrice!)}
            </span>
          )}

          {/* Savings Badge */}
          {hasDiscount && discountPercent > 0 && (
            <Badge variant="warning" size="md">
              {discountPercent}% OFF
            </Badge>
          )}
        </div>
      )}

      <span className="text-[11px] text-[var(--mq-text-tertiary)]">
        Includes all applicable VAT and local taxes. Delivery charges calculated at checkout.
      </span>
    </div>
  );
};
