'use client';

import React, { useState, useEffect } from 'react';
import { BadgePercent, Loader2 } from 'lucide-react';

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/refunds')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRefunds(data.refunds);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Refund History & Audit</h1>
        <p className="text-sm text-slate-400">
          Financial ledger of processed customer refunds across payment gateways.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Order Number</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Gateway Provider</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4 text-right">Refund Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Processed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    <span>Loading refund records...</span>
                  </td>
                </tr>
              ) : refunds.length > 0 ? (
                refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{r.orderNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{r.customerName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{r.provider}</td>
                    <td className="py-3.5 px-4 text-slate-400 italic max-w-xs truncate">{r.reason || 'Standard Refund'}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">৳{r.amount.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                    No processed refunds recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
