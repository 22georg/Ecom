'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, CheckCircle, XCircle, PackageCheck, Loader2 } from 'lucide-react';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = () => {
    setLoading(true);
    fetch('/api/admin/returns')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReturns(data.returns);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleReturnAction = async (returnId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/returns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReturns();
      }
    } catch (err) {
      // Error handling
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Return Requests Workspace</h1>
        <p className="text-sm text-slate-400">
          Moderate customer 14-day return submissions, approve restocks, and complete refunds.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-right">Est. Refund</th>
                <th className="py-3.5 px-4">Return Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    <span>Loading return requests...</span>
                  </td>
                </tr>
              ) : returns.length > 0 ? (
                returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{r.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200">{r.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{r.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <p className="font-semibold text-slate-300 truncate">{r.reason}</p>
                      {r.customerNote && <p className="text-[10px] text-slate-500 italic truncate">"{r.customerNote}"</p>}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-white">{r.itemCount}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">৳{r.estimatedRefundAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : r.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status === 'REQUESTED' && (
                          <>
                            <button
                              onClick={() => handleReturnAction(r.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReturnAction(r.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold border border-rose-500/30"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {r.status === 'APPROVED' && (
                          <button
                            onClick={() => handleReturnAction(r.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 text-[11px] font-bold"
                          >
                            Complete & Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                    No return requests submitted.
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
