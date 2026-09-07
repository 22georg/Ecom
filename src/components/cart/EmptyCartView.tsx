import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const EmptyCartView: React.FC = () => {
  return (
    <div className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] rounded-2xl p-12 text-center flex flex-col items-center justify-center my-8 shadow-xs">
      <div className="w-20 h-20 rounded-full bg-[var(--mq-surface-muted)] text-[var(--mq-text-tertiary)] flex items-center justify-center mb-6">
        <ShoppingBag className="w-10 h-10 text-[var(--mq-secondary)]" />
      </div>

      <h2 className="text-2xl font-display font-extrabold text-[var(--mq-text-primary)]">
        Your Cart is Currently Empty
      </h2>
      <p className="text-xs text-[var(--mq-text-tertiary)] max-w-sm mt-2 mb-8 leading-relaxed">
        Explore our curated collection of high-fidelity wireless audio, IoT telemetry nodes, and minimal workspace hardware.
      </p>

      <a href="/search">
        <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
          Explore Hardware Catalog
        </Button>
      </a>
    </div>
  );
};
