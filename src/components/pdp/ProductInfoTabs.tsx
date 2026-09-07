'use client';

import React, { useState } from 'react';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { FileText, Sliders, CheckCircle, Package, Truck, ShieldCheck } from 'lucide-react';

interface ProductInfoTabsProps {
  description?: string | null;
  specifications: Array<{ name: string; value: string }>;
  highlights: string[];
  whatsIncluded: string[];
  shippingNotice?: string;
  returnNotice?: string;
}

export const ProductInfoTabs: React.FC<ProductInfoTabsProps> = ({
  description,
  specifications,
  highlights,
  whatsIncluded,
  shippingNotice,
  returnNotice,
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'included' | 'shipping'>('description');

  const sanitizedDesc = sanitizeHtml(description);

  return (
    <div className="flex flex-col gap-6 py-8 border-t border-[var(--mq-border)] mt-8">
      {/* Navigation Tab Header Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--mq-border)] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'description'
              ? 'border-[var(--mq-secondary)] text-[var(--mq-secondary)] bg-[var(--mq-surface-muted)]/50 rounded-t-lg'
              : 'border-transparent text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Product Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'specs'
              ? 'border-[var(--mq-secondary)] text-[var(--mq-secondary)] bg-[var(--mq-surface-muted)]/50 rounded-t-lg'
              : 'border-transparent text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Technical Specifications</span>
        </button>

        <button
          onClick={() => setActiveTab('included')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'included'
              ? 'border-[var(--mq-secondary)] text-[var(--mq-secondary)] bg-[var(--mq-surface-muted)]/50 rounded-t-lg'
              : 'border-transparent text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>What's Included</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'shipping'
              ? 'border-[var(--mq-secondary)] text-[var(--mq-secondary)] bg-[var(--mq-surface-muted)]/50 rounded-t-lg'
              : 'border-transparent text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Shipping & Returns</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] p-6 sm:p-8 rounded-2xl shadow-xs">
        {/* Tab 1: Description & Highlights */}
        {activeTab === 'description' && (
          <div className="space-y-6">
            {/* Sanitized HTML Overview */}
            {sanitizedDesc ? (
              <div
                className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-[var(--mq-text-secondary)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizedDesc }}
              />
            ) : (
              <p className="text-xs text-[var(--mq-text-tertiary)]">No detailed description published for this product.</p>
            )}

            {/* Feature Highlights Grid */}
            {highlights.length > 0 && (
              <div className="pt-6 border-t border-[var(--mq-border)] space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--mq-text-primary)]">
                  Key Architectural Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[var(--mq-text-secondary)]">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Specifications Table */}
        {activeTab === 'specs' && (
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--mq-text-primary)] mb-4">
              Verified Technical Attributes
            </h4>

            {specifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-[var(--mq-border)]">
                    {specifications.map((spec, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-[var(--mq-surface-muted)]/40' : ''}>
                        <td className="py-3 px-4 font-bold text-[var(--mq-text-primary)] w-1/3 border-r border-[var(--mq-border)]">
                          {spec.name}
                        </td>
                        <td className="py-3 px-4 text-[var(--mq-text-secondary)] font-medium">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[var(--mq-text-tertiary)]">No specific attributes listed.</p>
            )}
          </div>
        )}

        {/* Tab 3: What's Included */}
        {activeTab === 'included' && (
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--mq-text-primary)] mb-4">
              In The Box
            </h4>

            {whatsIncluded.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whatsIncluded.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-[var(--mq-text-secondary)] p-2.5 rounded-lg bg-[var(--mq-surface-muted)]/50 border border-[var(--mq-border)] font-medium">
                    <Package className="w-4 h-4 text-[var(--mq-secondary)] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--mq-text-tertiary)]">Standard product packaging included.</p>
            )}
          </div>
        )}

        {/* Tab 4: Shipping & Returns */}
        {activeTab === 'shipping' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--mq-surface-muted)]/40 border border-[var(--mq-border)]">
              <div className="p-3 rounded-lg bg-[var(--mq-secondary-light)] text-[var(--mq-secondary)] shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[var(--mq-text-primary)]">
                  Logistics & Fulfillment
                </h5>
                <p className="text-xs text-[var(--mq-text-secondary)] leading-relaxed">
                  {shippingNotice || 'Orders placed before 2 PM are dispatched same day from our Central Dhaka Hub with real-time GPS telemetry.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--mq-surface-muted)]/40 border border-[var(--mq-border)]">
              <div className="p-3 rounded-lg bg-[var(--mq-secondary-light)] text-[var(--mq-secondary)] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[var(--mq-text-primary)]">
                  30-Day Guarantee
                </h5>
                <p className="text-xs text-[var(--mq-text-secondary)] leading-relaxed">
                  {returnNotice || 'Hassle-free automated return portal. Items in original condition are eligible for immediate store credit or exchange.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
