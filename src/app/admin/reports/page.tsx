'use client';

import React, { useState } from 'react';
import { BarChart3, Download, FileText, ShoppingBag, Package, Users, Warehouse } from 'lucide-react';

export default function AdminReportsPage() {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = (type: string) => {
    setExporting(type);
    window.location.href = `/api/admin/reports/export?type=${type}`;
    setTimeout(() => setExporting(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Operational Reports & CSV Exports</h1>
        <p className="text-sm text-slate-400">
          Generate business analytics reports and export authoritative CSV datasets for accounting and inventory audit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Orders CSV */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Orders Ledger</h3>
            <p className="text-xs text-slate-400 mt-1">Export full historical order records, payment status, and grand totals.</p>
          </div>
          <button
            onClick={() => handleExport('orders')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Orders CSV</span>
          </button>
        </div>

        {/* Products CSV */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mb-3">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Catalog Products</h3>
            <p className="text-xs text-slate-400 mt-1">Export product listings, SKUs, pricing, rating averages, and status.</p>
          </div>
          <button
            onClick={() => handleExport('products')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Products CSV</span>
          </button>
        </div>

        {/* Inventory CSV */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-3">
              <Warehouse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Inventory Audit</h3>
            <p className="text-xs text-slate-400 mt-1">Export stock quantities on hand, reserved units, and reorder thresholds.</p>
          </div>
          <button
            onClick={() => handleExport('inventory')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Inventory CSV</span>
          </button>
        </div>

        {/* Customers CSV */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Customer Directory</h3>
            <p className="text-xs text-slate-400 mt-1">Export registered customer emails, account statuses, and timestamps.</p>
          </div>
          <button
            onClick={() => handleExport('customers')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Customers CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
