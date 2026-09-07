'use client';

import React from 'react';
import { CreditCard, Banknote, ShieldCheck, Check } from 'lucide-react';

interface Props {
  selectedProvider: string;
  onSelect: (provider: string) => void;
}

export const CheckoutPaymentSelector: React.FC<Props> = ({ selectedProvider, onSelect }) => {
  const methods = [
    {
      id: 'COD',
      title: 'Cash on Delivery (COD)',
      description: 'Pay in cash when your package arrives at your doorstep.',
      icon: Banknote,
      badge: 'Popular in BD',
    },
    {
      id: 'ONLINE_GATEWAY',
      title: 'Online Card / Mobile Banking',
      description: 'Pay securely via Debit/Credit Card, bKash, Nagad, or Internet Banking.',
      icon: CreditCard,
      badge: 'Instant Verification',
    },
  ];

  return (
    <div className="bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--mq-border)]">
        <div className="w-10 h-10 rounded-xl bg-[var(--mq-primary-light)] text-[var(--mq-primary)] flex items-center justify-center font-bold text-lg">
          3
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--mq-text-primary)]">Payment Method</h2>
          <p className="text-sm text-[var(--mq-text-muted)]">Choose how you wish to pay for your order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedProvider === method.id;

          return (
            <div
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`cursor-pointer rounded-xl border p-4 transition relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[var(--mq-primary)] bg-[var(--mq-primary-light)]/20 shadow-sm'
                  : 'border-[var(--mq-border)] hover:border-[var(--mq-text-muted)] bg-[var(--mq-background)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-[var(--mq-primary)] text-white'
                          : 'bg-[var(--mq-surface)] text-[var(--mq-text-muted)] border border-[var(--mq-border)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-[var(--mq-text-primary)]">{method.title}</span>
                  </div>

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

                <p className="text-xs text-[var(--mq-text-muted)] leading-relaxed">{method.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--mq-border)]/50 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[var(--mq-primary)] tracking-wider">
                  {method.badge}
                </span>
                <span className="text-[11px] text-[var(--mq-text-muted)] font-medium">0% extra fee</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 bg-[var(--mq-background)] rounded-xl border border-[var(--mq-border)] flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[var(--mq-accent-emerald)] shrink-0" />
        <p className="text-xs text-[var(--mq-text-muted)] leading-normal">
          All MARQIVO transactions are protected by 256-bit SSL encryption. We never store sensitive banking credentials.
        </p>
      </div>
    </div>
  );
};
