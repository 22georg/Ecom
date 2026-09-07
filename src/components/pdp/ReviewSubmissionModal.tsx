'use client';

import React, { useState } from 'react';
import { Star, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Props {
  productId: string;
  productName: string;
  orderItemId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewSubmissionModal: React.FC<Props> = ({
  productId,
  productName,
  orderItemId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/catalog/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          orderItemId,
          rating,
          title,
          comment,
        }),
      });

      const json = await res.json();

      if (json.success) {
        addToast({
          type: 'success',
          title: 'Review Submitted',
          description: 'Thank you for rating your purchase on MARQIVO!',
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        addToast({
          type: 'error',
          title: 'Review Error',
          description: json.message || 'Failed to submit review.',
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: err.message || 'Failed to submit review.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative mq-animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--mq-text-muted)] hover:bg-[var(--mq-surface-muted)] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--mq-accent-emerald)] bg-[var(--mq-accent-emerald)]/10 px-2.5 py-1 rounded-full mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase
          </span>
          <h2 className="text-xl font-bold text-[var(--mq-text-primary)]">Rate & Review Product</h2>
          <p className="text-xs text-[var(--mq-text-muted)] truncate mt-0.5">{productName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Picker */}
          <div>
            <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-2">
              Your Overall Rating <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        active
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-none text-[var(--mq-border)] hover:text-amber-300'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-[var(--mq-text-primary)] ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-1">
              Headline / Summary Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Outstanding build quality and battery life!"
              className="w-full px-3 py-2 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-xs text-[var(--mq-text-primary)] focus:outline-none focus:border-[var(--mq-primary)]"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-1">
              Your Review & Experience <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike about this product? How is the performance?"
              className="w-full px-3 py-2 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-xs text-[var(--mq-text-primary)] focus:outline-none focus:border-[var(--mq-primary)]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--mq-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--mq-surface)] border border-[var(--mq-border)] text-xs font-semibold text-[var(--mq-text-primary)] rounded-xl hover:bg-[var(--mq-background)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[var(--mq-primary)] hover:bg-[var(--mq-primary-dark)] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
