import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { FormattedBreadcrumb } from '@/services/product-detail.service';

export const ProductBreadcrumbs: React.FC<{ items: FormattedBreadcrumb[]; className?: string }> = ({
  items,
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb navigation" className={`flex items-center text-xs text-[var(--mq-text-tertiary)] overflow-x-auto py-1 scrollbar-none ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 mx-1.5 shrink-0 text-slate-400" />}
            {isLast ? (
              <span className="font-bold text-[var(--mq-text-primary)] truncate max-w-xs" aria-current="page">
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="hover:text-[var(--mq-secondary)] transition-colors whitespace-nowrap flex items-center gap-1 font-medium"
              >
                {idx === 0 && <Home className="w-3.5 h-3.5" />}
                <span>{item.label}</span>
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
