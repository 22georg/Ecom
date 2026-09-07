'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  RotateCcw,
  Star,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
  Clock,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'month' | 'all'>('30d');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = (p: string) => {
    setLoading(true);
    fetch(`/api/admin/dashboard?period=${p}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMetrics(data.metrics);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics(period);
  }, [period]);

  const sales = metrics?.sales || { grossSales: 0, netSales: 0, orderCount: 0, averageOrderValue: 0 };
  const statusCounts = metrics?.orderStatusCounts || { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  const inventory = metrics?.inventory || { totalItems: 0, lowStockCount: 0, outOfStockCount: 0 };
  const recentOrders = metrics?.recentOrders || [];
  const topProducts = metrics?.topProducts || [];
  const timeSeries = metrics?.timeSeries || [];

  return (
    <div className="space-y-8">
      {/* Header Section & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Operations Overview</h1>
          <p className="text-sm text-slate-400">
            Real-time business performance derived directly from PostgreSQL database records.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          {(['today', '7d', '30d', 'month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all ${
                period === p
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => fetchMetrics(period)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Gross Sales */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Sales</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-white">
              BDT ৳{sales.grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Net: ৳{sales.netSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-white">{sales.orderCount}</h3>
            <p className="mt-1 text-xs text-slate-400">
              AOV: ৳{sales.averageOrderValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Alerts</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-white">{inventory.lowStockCount + inventory.outOfStockCount}</h3>
            <p className="mt-1 text-xs text-amber-400">
              {inventory.outOfStockCount} Out of Stock • {inventory.lowStockCount} Low
            </p>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Customers</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-white">{metrics?.customers?.totalCustomers || 0}</h3>
            <p className="mt-1 text-xs text-slate-400">
              +{metrics?.customers?.newCustomersPeriod || 0} in selected period
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Order Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart Container */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Sales Performance Trend</h2>
              <p className="text-xs text-slate-400">Daily gross revenue trajectory</p>
            </div>
          </div>

          {timeSeries.length > 0 ? (
            <div className="h-64 flex items-end gap-2 pt-6 border-b border-slate-800">
              {timeSeries.map((item: any, idx: number) => {
                const maxVal = Math.max(...timeSeries.map((t: any) => t.grossSales), 1);
                const heightPct = Math.round((item.grossSales / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 text-[10px] p-1.5 rounded-lg text-white pointer-events-none whitespace-nowrap z-20 shadow-xl">
                      ৳{item.grossSales.toLocaleString()} ({item.ordersCount} orders)
                    </div>

                    <div
                      style={{ height: `${Math.max(8, heightPct)}%` }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md group-hover:from-emerald-500 group-hover:to-teal-300 transition-all"
                    />
                    <span className="text-[10px] text-slate-500 truncate w-full text-center">
                      {item.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm italic">
              No sales records in selected period
            </div>
          )}
        </div>

        {/* Order Status Distribution Card */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Order Pipeline</h2>
            <p className="text-xs text-slate-400 mb-6">Status breakdown of recorded orders</p>

            <div className="space-y-4">
              {[
                { label: 'Pending', count: statusCounts.pending, color: 'bg-amber-400' },
                { label: 'Processing', count: statusCounts.processing, color: 'bg-blue-400' },
                { label: 'Shipped', count: statusCounts.shipped, color: 'bg-indigo-400' },
                { label: 'Delivered', count: statusCounts.delivered, color: 'bg-emerald-400' },
                { label: 'Cancelled', count: statusCounts.cancelled, color: 'bg-rose-400' },
              ].map((st) => (
                <div key={st.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{st.label}</span>
                    <span className="text-slate-400">{st.count}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${sales.orderCount > 0 ? (st.count / sales.orderCount) * 100 : 0}%`,
                      }}
                      className={`h-full ${st.color} rounded-full transition-all`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <span>Manage All Orders</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-emerald-400 font-semibold hover:underline">
              View All ↗
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentOrders.length > 0 ? (
                  recentOrders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        <Link href={`/admin/orders/${o.id}`}>{o.orderNumber}</Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium">{o.customerName}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : o.status === 'SHIPPED'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : o.status === 'CANCELLED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">
                        ৳{o.grandTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 italic">
                      No recent orders recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Top Products</h2>
            <span className="text-xs text-slate-400">By Quantity Sold</span>
          </div>

          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((p: any, idx: number) => (
                <div key={p.productId || idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="truncate pr-2">
                    <p className="text-xs font-semibold text-slate-200 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-emerald-400">{p.totalQuantitySold} sold</p>
                    <p className="text-[10px] text-slate-400">৳{p.totalRevenue.toFixed(0)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-6">No top sales data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
