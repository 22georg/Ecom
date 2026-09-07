'use client';

import React from 'react';
import { FormattedProductOption, FormattedVariant } from '@/services/product-detail.service';

interface ProductOptionSelectorProps {
  options: FormattedProductOption[];
  variants: FormattedVariant[];
  selectedOptions: { [optionName: string]: string };
  onSelectOption: (optionName: string, value: string) => void;
}

export const ProductOptionSelector: React.FC<ProductOptionSelectorProps> = ({
  options,
  variants,
  selectedOptions,
  onSelectOption,
}) => {
  if (!options || options.length === 0) return null;

  /**
   * Check if selecting a specific option value would yield a valid variant
   * in combination with currently selected other options.
   */
  const isOptionValueValid = (targetOptionName: string, targetValue: string): boolean => {
    const candidateSelections = {
      ...selectedOptions,
      [targetOptionName]: targetValue,
    };

    // Find if at least one active variant matches all specified candidate selections
    return variants.some((v) => {
      return Object.entries(candidateSelections).every(([optName, optVal]) => {
        // Find if this variant has this option with matching value
        const found = v.options.find(
          (o) => o.optionName === optName && o.optionValue === optVal
        );
        return Boolean(found);
      });
    });
  };

  return (
    <div className="flex flex-col gap-5 py-4 border-y border-[var(--mq-border)]">
      {options.map((opt) => (
        <div key={opt.id} className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-[var(--mq-text-primary)]">
              {opt.name}:{' '}
              <span className="font-semibold text-[var(--mq-secondary)] capitalize">
                {selectedOptions[opt.name] || 'Select choice'}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={`Select ${opt.name}`}>
            {opt.values.map((v) => {
              const isSelected = selectedOptions[opt.name] === v.value;
              const isValid = isOptionValueValid(opt.name, v.value);

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => isValid && onSelectOption(opt.name, v.value)}
                  disabled={!isValid}
                  aria-checked={isSelected}
                  role="radio"
                  className={`min-w-20 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--mq-primary)] text-white shadow-sm ring-2 ring-[var(--mq-secondary)]'
                      : isValid
                      ? 'bg-[var(--mq-surface-card)] text-[var(--mq-text-primary)] border border-[var(--mq-border)] hover:border-[var(--mq-secondary)] hover:bg-[var(--mq-surface-muted)]'
                      : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-50'
                  }`}
                  title={!isValid ? `${v.value} is not available with current selections` : v.value}
                >
                  <span>{v.value}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
