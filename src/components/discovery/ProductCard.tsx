'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Star, Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import { useToast } from '../ui/Toast';

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  categoryName?: string;
  brandName?: string;
  price: number;
  compareAtPrice?: number;
  ratingAvg?: number;
  reviewCount?: number;
  mediaUrl?: string;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export const ProductCard: React.FC<{ product: ProductCardData }> = ({ product }) => {
  const { addToast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  const priceNum = Number(product.price);
  const compareNum = product.compareAtPrice ? Number(product.compareAtPrice) : undefined;
  const hasDiscount = compareNum && compareNum > priceNum;
  const discountPercent = hasDiscount
    ? Math.round(((compareNum - priceNum) / compareNum) * 100)
    : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    addToast({
      type: isSaved ? 'neutral' : 'info',
      title: isSaved ? 'Removed from Wishlist' : 'Saved to Wishlist',
      description: `${product.name} updated in customer saved list.`,
    });
  };

  return (
    <Card variant="interactive" className="group flex flex-col justify-between h-full">
      <div>
        {/* Aspect-Ratio Preserved Image Box */}
        <div className="relative aspect-4/3 w-full bg-[var(--mq-surface-muted)] overflow-hidden flex items-center justify-center border-b border-[var(--mq-border)]">
          {product.mediaUrl ? (
            <img
              src={product.mediaUrl}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[var(--mq-primary)] text-white font-bold text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              {product.name.charAt(0)}
            </div>
          )}

          {/* Discount & Promo Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
            {hasDiscount && (
              <Badge variant="warning" size="sm">
                {discountPercent}% OFF
              </Badge>
            )}
            {product.stockStatus === 'low_stock' && (
              <Badge variant="error" size="sm">
                Low Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
              isSaved
                ? 'bg-red-50 text-red-500 shadow-md'
                : 'bg-white/80 dark:bg-black/60 text-[var(--mq-text-secondary)] hover:text-red-500'
            }`}
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content Info */}
        <div className="p-4 flex flex-col gap-1.5">
          {product.categoryName && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--mq-secondary)]">
              {product.categoryName}
            </span>
          )}

          <a href={`/search?q=${encodeURIComponent(product.name)}`} className="group-hover:text-[var(--mq-secondary)] transition-colors">
            <h3 className="font-bold text-sm text-[var(--mq-text-primary)] leading-snug line-clamp-2">
              {product.name}
            </h3>
          </a>

          {/* Real Rating Stars */}
          {product.ratingAvg !== undefined && product.ratingAvg > 0 ? (
            <div className="flex items-center gap-1.5 text-xs mt-1">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-bold text-[var(--mq-text-primary)]">{product.ratingAvg.toFixed(1)}</span>
              {product.reviewCount !== undefined && (
                <span className="text-[var(--mq-text-tertiary)]">({product.reviewCount})</span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-[var(--mq-text-tertiary)] mt-1">New Arrival</span>
          )}
        </div>
      </div>

      {/* Price & Action Footer */}
      <div className="p-4 pt-0 flex items-center justify-between border-t border-[var(--mq-border)] mt-3">
        <div className="flex flex-col pt-3">
          <div className="flex items-center gap-2">
            <span className="mq-price text-base text-[var(--mq-text-primary)] font-bold">
              ${priceNum.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[var(--mq-text-tertiary)] line-through">
                ${compareNum!.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[var(--mq-success-text)] font-semibold">
            {product.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => (window.location.href = `/search?q=${encodeURIComponent(product.name)}`)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View
        </Button>
      </div>
    </Card>
  );
};
