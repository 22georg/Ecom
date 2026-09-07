import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ProductAvailabilityBadgeProps {
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockQty?: number;
}

export const ProductAvailabilityBadge: React.FC<ProductAvailabilityBadgeProps> = ({
  stockStatus,
  stockQty = 0,
}) => {
  if (stockStatus === 'out_of_stock') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50 text-xs font-semibold">
        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
        <span>Out of Stock — Currently unavailable for purchase</span>
      </div>
    );
  }

  if (stockStatus === 'low_stock') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 text-xs font-semibold">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <span>Low Stock — Only {stockQty} units remaining in Dhaka warehouse</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      <span>In Stock — Ready for immediate 24h dispatch</span>
    </div>
  );
};
