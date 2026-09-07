'use client';

import React from 'react';
import { Receipt } from 'lucide-react';

export default function AdminTaxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Tax Configuration Foundation</h1>
        <p className="text-sm text-slate-400">
          Configure tax rules, VAT percentage calculation, and regional tax exemptions.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl max-w-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Default Value Added Tax (VAT)</h2>
            <p className="text-xs text-slate-400">Standard tax rate applied to checkout cart items</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Standard VAT Rate:</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">0.00% (Inclusive / Zero-rated)</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Tax Calculation Mode:</span>
            <span className="text-slate-200 font-semibold">Backend Authoritative Service</span>
          </div>
        </div>
      </div>
    </div>
  );
}
