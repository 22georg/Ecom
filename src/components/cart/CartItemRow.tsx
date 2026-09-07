'use client';

import React from 'react';
import { Trash2, Heart, Plus, Minus } from 'lucide-react';
import { FormattedCartItem } from '@/services/cart.service';

interface CartItemRowProps {
  item: FormattedCartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onSaveToWishlist?: (productId: string) => void;
  isCompact?: boolean;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
  onSaveToWishlist,
  isCompact = false,
}) => {
  const formatCurrency = (val: number) => `৳${val.toLocaleString()}`;

  return (
    <div
      className={`flex gap-4 p-4 rounded-xl bg-[var(--mq-surface-card)] border border-[var(--mq-border)] transition-colors ${
        item.stockAlert ? 'border-amber-400 bg-amber-50/20' : ''
      }`}
    >
      {/* Product Image Thumbnail */}
      <a href={`/product/${item.productSlug}`} className="shrink-0 group">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[var(--mq-surface-muted)] overflow-hidden border border-[var(--mq-border)] flex items-center justify-center">
          {item.mediaUrl ? (
            <img
              src={item.mediaUrl}
              alt={item.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <span className="font-bold text-xs text-[var(--mq-secondary)]">{item.productName.charAt(0)}</span>
          )}
        </div>
      </a>

      {/* Product Details & Variant Label */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <a href={`/product/${item.productSlug}`} className="hover:text-[var(--mq-secondary)] transition-colors">
              <h4 className="font-bold text-xs sm:text-sm text-[var(--mq-text-primary)] leading-snug truncate">
                {item.productName}
              </h4>
            </a>
            {/* Unit Price */}
            <span className="font-display font-bold text-xs sm:text-sm text-[var(--mq-text-primary)] shrink-0">
              {formatCurrency(item.unitPrice)}
            </span>
          </div>

          {/* Variant Label */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-semibold text-[var(--mq-secondary)] bg-[var(--mq-secondary-light)] px-2 py-0.5 rounded">
              {item.variantLabel}
            </span>
            {item.sku && (
              <span className="text-[10px] font-mono text-[var(--mq-text-tertiary)] hidden sm:inline">
                ({item.sku})
              </span>
            )}
          </div>

          {/* Stock Alert Warning if stock is limited */}
          {item.stockAlert && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
              ⚠️ {item.stockAlert}
            </span>
          )}
        </div>

        {/* Quantity Controls & Line Total */}
        <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-[var(--mq-border)]/50">
          {/* Quantity Controls */}
          <div className="flex items-center border border-[var(--mq-border)] rounded-md bg-[var(--mq-surface-muted)] p-0.5">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="p-1 text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface)] rounded cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-[var(--mq-text-primary)]">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1 text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface)] rounded cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Line Subtotal & Action Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[var(--mq-text-primary)]">
              Subtotal: <span className="font-display font-extrabold">{formatCurrency(item.lineSubtotal)}</span>
            </span>

            {!isCompact && onSaveToWishlist && (
              <button
                type="button"
                onClick={() => onSaveToWishlist(item.productId)}
                className="p-1.5 text-[var(--mq-text-tertiary)] hover:text-red-500 rounded transition-colors cursor-pointer"
                title="Save to Wishlist"
              >
                <Heart className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onRemoveItem(item.id)}
              className="p-1.5 text-[var(--mq-text-tertiary)] hover:text-red-500 rounded transition-colors cursor-pointer"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
