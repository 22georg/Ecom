'use client';

import React, { useState, useEffect } from 'react';
import {
  Warehouse,
  Search,
  SlidersHorizontal,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  PlusCircle,
  MinusCircle,
  FileText,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'levels' | 'history'>('levels');

  // Adjustment Modal
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<string>('INBOUND');
  const [deltaQuantity, setDeltaQuantity] = useState<string>('10');
  const [reason, setReason] = useState<string>('Stock received from supplier');
  const [adjusting, setAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = () => {
    setLoading(true);
    fetch(`/api/admin/inventory?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItems(data.items);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchHistory = () => {
    fetch('/api/admin/inventory/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMovements(data.movements);
        }
      });
  };

  useEffect(() => {
    fetchInventory();
  }, [search]);

  useEffect(() => {
    if (tab === 'history') {
      fetchHistory();
    }
  }, [tab]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setAdjusting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: selectedItem.id,
          adjustmentType,
          deltaQuantity: parseInt(deltaQuantity, 10),
          reason,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Adjustment failed');
      }

      setSelectedItem(null);
      fetchInventory();
    } catch (err: any) {
      setError(err.message || 'Stock adjustment failed');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Warehouse & Stock Control</h1>
          <p className="text-sm text-slate-400">
            Monitor quantity on hand, reorder thresholds, and record controlled stock adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setTab('levels')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'levels'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stock Levels
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'history'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Movement Audit Trail
          </button>
        </div>
      </div>

      {tab === 'levels' ? (
        <>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter product or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Item SKU</th>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Warehouse</th>
                    <th className="py-3.5 px-4 text-center">On Hand</th>
                    <th className="py-3.5 px-4 text-center">Reserved</th>
                    <th className="py-3.5 px-4 text-center">Available</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                        <span>Loading inventory levels...</span>
                      </td>
                    </tr>
                  ) : items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{item.sku}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{item.productName}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">{item.warehouseCode}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">{item.quantityOnHand}</td>
                        <td className="py-3.5 px-4 text-center text-slate-400">{item.quantityReserved}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                          {item.availableQuantity}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'OUT_OF_STOCK'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : item.status === 'LOW_STOCK'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition-colors"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 italic">
                        No inventory records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Product / SKU</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Quantity Delta</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-200">{m.productName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{m.sku}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                        {m.movementType}
                      </span>
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold ${
                        m.quantityDelta > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 italic">{m.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Controlled Stock Adjustment</h2>
            <p className="text-xs text-slate-400 mb-4">
              Item: <span className="text-emerald-400 font-bold">{selectedItem.productName}</span> ({selectedItem.sku})
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Adjustment Type *</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="INBOUND">INBOUND (Add Received Stock)</option>
                  <option value="OUTBOUND">OUTBOUND (Deduct Damaged/Removed Stock)</option>
                  <option value="CORRECTION">CORRECTION (Manual Reconciliation)</option>
                  <option value="RETURN">RETURN (Restock Returned Item)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Quantity Delta *</label>
                <input
                  type="number"
                  required
                  value={deltaQuantity}
                  onChange={(e) => setDeltaQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Mandatory Operational Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State operational reason for audit logging..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {adjusting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Commit Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
