'use client';

import React from 'react';
import { Truck, Check, Clock } from 'lucide-react';

export interface ShippingMethodOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  isFree?: boolean;
}

interface Props {
  options: ShippingMethodOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const CheckoutShippingSelector: React.FC<Props> = ({ options, selectedId, onSelect }) => {
  return (
    <div className="bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--mq-border)]">
        <div className="w-10 h-10 rounded-xl bg-[var(--mq-primary-light)] text-[var(--mq-primary)] flex items-center justify-center font-bold text-lg">
          2
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--mq-text-primary)]">Shipping Method</h2>
          <p className="text-sm text-[var(--mq-text-muted)]">Select your preferred delivery option</p>
        </div>
      </div>

      <div className="space-y-3">
        {options.map((method) => {
          const isSelected = selectedId === method.id;
          return (
            <div
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`cursor-pointer rounded-xl border p-4 transition flex items-center justify-between ${
                isSelected
                  ? 'border-[var(--mq-primary)] bg-[var(--mq-primary-light)]/20 shadow-sm'
                  : 'border-[var(--mq-border)] hover:border-[var(--mq-text-muted)] bg-[var(--mq-background)]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? 'bg-[var(--mq-primary)] text-white'
                      : 'bg-[var(--mq-surface)] text-[var(--mq-text-muted)] border border-[var(--mq-border)]'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[var(--mq-text-primary)]">{method.name}</p>
                    {method.isFree && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--mq-accent-emerald)] bg-[var(--mq-accent-emerald)]/10 px-2 py-0.5 rounded-full">
                        FREE SHIPPING
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--mq-text-muted)] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    Estimated Delivery: {method.estimatedDays}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-sm text-[var(--mq-text-primary)]">
                  {method.price === 0 ? 'FREE' : `৳${method.price.toLocaleString()}`}
                </span>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                    isSelected
                      ? 'border-[var(--mq-primary)] bg-[var(--mq-primary)] text-white'
                      : 'border-[var(--mq-border)] bg-[var(--mq-surface)]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
