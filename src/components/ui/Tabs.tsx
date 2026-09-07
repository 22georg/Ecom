'use client';

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'line' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  className = '',
}) => {
  if (variant === 'pills') {
    return (
      <div className={`flex items-center gap-1.5 p-1 bg-[var(--mq-surface-muted)] rounded-lg w-max border border-[var(--mq-border)] ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                isActive
                  ? 'bg-[var(--mq-surface)] text-[var(--mq-text-primary)] shadow-xs'
                  : 'text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)]'
              }`}
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive
                      ? 'bg-[var(--mq-secondary-light)] text-[var(--mq-secondary)]'
                      : 'bg-[var(--mq-surface)] text-[var(--mq-text-tertiary)]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center border-b border-[var(--mq-border)] gap-6 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 py-3 text-sm font-semibold border-b-2 transition-all duration-150 relative -mb-px ${
              isActive
                ? 'border-[var(--mq-secondary)] text-[var(--mq-secondary)]'
                : 'border-transparent text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)] hover:border-[var(--mq-border-hover)]'
            }`}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full font-bold bg-[var(--mq-surface-muted)] text-[var(--mq-text-secondary)]">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
