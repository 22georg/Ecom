import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex items-center justify-between gap-4 text-xs font-medium ${className}`}>
      <span className="text-[var(--mq-text-secondary)]">
        Showing page <strong className="text-[var(--mq-text-primary)]">{currentPage}</strong> of{' '}
        <strong className="text-[var(--mq-text-primary)]">{totalPages}</strong>
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-md text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[var(--mq-primary)] text-white shadow-xs'
                  : 'text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)]'
              }`}
            >
              {p}
            </button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
