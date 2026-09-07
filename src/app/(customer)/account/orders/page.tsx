'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowRight, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/account/orders')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setOrders(json.data);
        } else {
          setError(json.message || 'Failed to load order history');
        }
      })
      .catch((err) => setError(err.message || 'Network error'))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'ALL') return true;
    return o.status === activeFilter;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
      case 'PROCESSING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--mq-primary)] animate-spin mb-4" />
        <p className="text-sm font-semibold text-[var(--mq-text-muted)]">Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mq-animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--mq-text-primary)]">My Orders</h1>
          <p className="text-xs text-[var(--mq-text-secondary)] mt-1">Track current shipments and view historical invoices</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeFilter === filter
                  ? 'bg-[var(--mq-primary)] text-white shadow-xs'
                  : 'bg-[var(--mq-surface-muted)] text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card variant="default" className="p-12 text-center flex flex-col items-center justify-center">
          <Package className="w-16 h-16 text-[var(--mq-text-tertiary)] mb-4" />
          <h3 className="text-lg font-bold text-[var(--mq-text-primary)] mb-1">No Orders Found</h3>
          <p className="text-xs text-[var(--mq-text-secondary)] mb-6 max-w-sm">
            {activeFilter === 'ALL'
              ? "You haven't placed any orders with MARQIVO yet."
              : `No orders matching filter "${activeFilter}".`}
          </p>
          <Link
            href="/search"
            className="px-6 py-2.5 bg-[var(--mq-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[var(--mq-primary-dark)] transition"
          >
            Start Shopping
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const firstItem = order.items[0];
            return (
              <Card
                key={order.id}
                variant="interactive"
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-[var(--mq-border)] hover:border-[var(--mq-primary)]/50 transition"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="relative w-16 h-16 rounded-xl bg-[var(--mq-surface-muted)] border border-[var(--mq-border)] overflow-hidden shrink-0">
                    {firstItem?.imageUrl ? (
                      <Image src={firstItem.imageUrl} alt={firstItem.productName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--mq-text-tertiary)]">
                        IMG
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-bold text-sm text-[var(--mq-primary)]">{order.orderNumber}</span>
                      <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                        {order.status}
                      </Badge>
                      <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
                        {order.paymentStatus}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-xs text-[var(--mq-text-primary)] truncate">
                      {firstItem?.productName || 'Order Items'}
                      {order.items.length > 1 && ` + ${order.items.length - 1} more item(s)`}
                    </h4>

                    <p className="text-[11px] text-[var(--mq-text-tertiary)] flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--mq-border)]">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--mq-text-tertiary)] tracking-wider block">
                      Total Amount
                    </span>
                    <span className="text-lg font-black text-[var(--mq-text-primary)]">
                      ৳{Number(order.grandTotal).toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="px-4 py-2 bg-[var(--mq-surface)] border border-[var(--mq-border)] hover:bg-[var(--mq-primary)] hover:text-white hover:border-[var(--mq-primary)] text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
