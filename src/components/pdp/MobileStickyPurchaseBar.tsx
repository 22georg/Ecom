'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';

interface MobileStickyPurchaseBarProps {
  productName: string;
  price: number;
  selectedVariantLabel?: string;
  isAvailable: boolean;
  onAddToCart: () => void;
}

export const MobileStickyPurchaseBar: React.FC<MobileStickyPurchaseBarProps> = ({
  productName,
  price,
  selectedVariantLabel,
  isAvailable,
  onAddToCart,
}) => {
  const formattedPrice = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  })
    .format(price)
    .replace('BDT', '৳');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[var(--mq-surface)]/95 backdrop-blur-md border-t border-[var(--mq-border)] p-3 shadow-2xl mq-animate-fade-in">
      <div className="mq-container flex items-center justify-between gap-3">
        <div className="flex flex-col truncate">
          <span className="font-bold text-xs text-[var(--mq-text-primary)] truncate">
            {productName}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-sm text-[var(--mq-text-primary)]">
              {formattedPrice}
            </span>
            {selectedVariantLabel && (
              <span className="text-[10px] text-[var(--mq-text-tertiary)] truncate">
                ({selectedVariantLabel})
              </span>
            )}
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={!isAvailable}
          onClick={onAddToCart}
          leftIcon={<ShoppingBag className="w-4 h-4" />}
          className="shrink-0 font-bold"
        >
          {isAvailable ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};
