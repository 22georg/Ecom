'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface ProductQuantitySelectorProps {
  quantity: number;
  maxStock?: number;
  onChangeQuantity: (newQty: number) => void;
  disabled?: boolean;
}

export const ProductQuantitySelector: React.FC<ProductQuantitySelectorProps> = ({
  quantity,
  maxStock = 99,
  onChangeQuantity,
  disabled = false,
}) => {
  const maxLimit = Math.max(1, maxStock);

  const handleDecrement = () => {
    if (quantity > 1 && !disabled) {
      onChangeQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxLimit && !disabled) {
      onChangeQuantity(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      onChangeQuantity(1);
    } else if (val > maxLimit) {
      onChangeQuantity(maxLimit);
    } else {
      onChangeQuantity(val);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-[var(--mq-text-primary)]">
        Quantity
      </label>
      <div className="inline-flex items-center rounded-lg border border-[var(--mq-border)] bg-[var(--mq-surface-card)] p-1 w-32 shadow-xs">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || quantity <= 1}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <input
          type="number"
          min={1}
          max={maxLimit}
          value={quantity}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-12 h-8 text-center text-xs font-bold bg-transparent text-[var(--mq-text-primary)] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Product quantity"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || quantity >= maxLimit}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
