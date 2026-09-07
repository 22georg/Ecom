'use client';

import React, { useState } from 'react';
import { Tag, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface CouponInputBoxProps {
  activeCouponCode?: string | null;
  onApplyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  onRemoveCoupon: () => Promise<boolean>;
}

export const CouponInputBox: React.FC<CouponInputBoxProps> = ({
  activeCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const result = await onApplyCoupon(code.trim());
    setIsSubmitting(false);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setCode('');
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleRemove = async () => {
    setIsSubmitting(true);
    await onRemoveCoupon();
    setIsSubmitting(false);
    setFeedback(null);
  };

  return (
    <div className="flex flex-col gap-2 pt-3 border-t border-[var(--mq-border)]">
      <label className="text-xs font-bold uppercase tracking-wider text-[var(--mq-text-primary)] flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-[var(--mq-secondary)]" />
        <span>Promotional Coupon</span>
      </label>

      {activeCouponCode ? (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Code <strong className="font-mono">{activeCouponCode}</strong> Applied</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isSubmitting}
            className="p-1 text-emerald-700 hover:text-red-500 rounded transition-colors cursor-pointer"
            aria-label="Remove coupon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter code (e.g. MARQIVO10)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-9 px-3 text-xs rounded-md bg-[var(--mq-surface)] border border-[var(--mq-border)] text-[var(--mq-text-primary)] placeholder-slate-400 focus:outline-none focus:border-[var(--mq-secondary)] w-full uppercase"
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={isSubmitting || !code.trim()}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Apply
          </Button>
        </form>
      )}

      {feedback && (
        <p className={`text-[11px] font-semibold ${feedback.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
};
