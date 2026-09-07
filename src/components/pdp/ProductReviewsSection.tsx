import React from 'react';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import { RatingSummary, FormattedReview } from '@/services/product-detail.service';

interface ProductReviewsSectionProps {
  summary: RatingSummary;
  reviews: FormattedReview[];
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  summary,
  reviews,
}) => {
  const total = summary.totalCount > 0 ? summary.totalCount : 1;

  return (
    <section id="reviews" className="py-8 border-t border-[var(--mq-border)] mt-8 scroll-mt-20">
      <div className="flex flex-col gap-6">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--mq-secondary)] uppercase tracking-wider mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Customer Telemetry</span>
            </div>
            <h3 className="text-2xl font-display font-extrabold text-[var(--mq-text-primary)]">
              Verified Customer Reviews
            </h3>
          </div>
        </div>

        {/* Rating Breakdown & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-[var(--mq-surface-card)] border border-[var(--mq-border)] p-6 sm:p-8 rounded-2xl">
          {/* Average Rating Block */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-[var(--mq-surface-muted)] rounded-xl text-center border border-[var(--mq-border)]">
            <span className="text-5xl font-display font-extrabold text-[var(--mq-text-primary)]">
              {summary.average > 0 ? summary.average.toFixed(1) : '0.0'}
            </span>
            <div className="flex items-center text-amber-500 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(summary.average) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-[var(--mq-text-tertiary)]">
              Based on {summary.totalCount} verified buyer {summary.totalCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {/* Distribution Bar Chart */}
          <div className="md:col-span-8 flex flex-col justify-center gap-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = summary.distribution[stars] || 0;
              const percent = Math.round((count / total) * 100);

              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold text-[var(--mq-text-primary)] shrink-0 flex items-center gap-1">
                    {stars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-[var(--mq-surface-muted)] overflow-hidden border border-[var(--mq-border)]">
                    <div
                      className="h-full bg-[var(--mq-secondary)] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-[var(--mq-text-tertiary)] text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] p-5 rounded-xl flex flex-col justify-between gap-3 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-[var(--mq-text-tertiary)]">{r.createdAt}</span>
                  </div>

                  {r.title && (
                    <h5 className="font-bold text-sm text-[var(--mq-text-primary)]">{r.title}</h5>
                  )}

                  {r.comment && (
                    <p className="text-xs text-[var(--mq-text-secondary)] leading-relaxed">{r.comment}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--mq-border)] text-[11px] text-[var(--mq-success-text)] font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{r.customerName} (Verified Purchase)</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] p-8 rounded-xl text-center">
            <MessageSquare className="w-8 h-8 text-[var(--mq-text-tertiary)] mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-sm text-[var(--mq-text-primary)]">No Reviews Yet</h4>
            <p className="text-xs text-[var(--mq-text-tertiary)] max-w-sm mx-auto mt-1">
              Be the first customer to share feedback on this MARQIVO hardware unit.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
