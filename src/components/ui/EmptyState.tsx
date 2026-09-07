import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <PackageSearch className="w-12 h-12 text-[var(--mq-secondary)]" />,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-xl ${className}`}>
      <div className="p-4 bg-[var(--mq-secondary-light)]/40 rounded-full mb-4">{icon}</div>
      <h4 className="text-lg font-bold text-[var(--mq-text-primary)]">{title}</h4>
      <p className="text-xs text-[var(--mq-text-secondary)] max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
