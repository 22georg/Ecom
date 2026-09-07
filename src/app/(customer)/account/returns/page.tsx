'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RotateCcw, Clock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export default function CustomerReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/account/returns')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setReturns(json.data);
        } else {
          setError(json.message || 'Failed to fetch returns history');
        }
      })
      .catch((err) => setError(err.message || 'Network error'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'success';
      case 'UNDER_REVIEW':
      case 'REQUESTED':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--mq-primary)] animate-spin mb-4" />
        <p className="text-sm font-semibold text-[var(--mq-text-muted)]">Loading return requests...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mq-animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--mq-border)]">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--mq-text-primary)]">Return Requests & Refunds</h1>
          <p className="text-xs text-[var(--mq-text-secondary)] mt-1">Track return request progress and refund dispatches</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Return Policy Banner */}
      <Card variant="default" className="p-4 bg-[var(--mq-primary-light)]/30 border border-[var(--mq-primary)]/20 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[var(--mq-primary)] shrink-0" />
        <p className="text-xs text-[var(--mq-text-primary)]">
          <strong>MARQIVO 14-Day Hassle-Free Returns:</strong> Items delivered within 14 days can be returned if damaged, wrong size, or defective. Free home pick-up is available.
        </p>
      </Card>

      {/* Returns List */}
      {returns.length === 0 ? (
        <Card variant="default" className="p-12 text-center flex flex-col items-center justify-center">
          <RotateCcw className="w-16 h-16 text-[var(--mq-text-tertiary)] mb-4" />
          <h3 className="text-lg font-bold text-[var(--mq-text-primary)] mb-1">No Return Requests</h3>
          <p className="text-xs text-[var(--mq-text-secondary)] mb-6 max-w-sm">
            You haven't requested any order returns or refunds.
          </p>
          <Link
            href="/account/orders"
            className="px-6 py-2.5 bg-[var(--mq-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[var(--mq-primary-dark)] transition"
          >
            View Orders
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <Card key={ret.id} variant="default" className="p-6 border border-[var(--mq-border)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mq-border)]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono font-bold text-sm text-[var(--mq-primary)]">
                      Order #{ret.order.orderNumber}
                    </span>
                    <Badge variant={getStatusBadgeVariant(ret.status)} size="sm">
                      {ret.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--mq-text-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Requested on {new Date(ret.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-[var(--mq-text-tertiary)] tracking-wider block">
                    Reason for Return
                  </span>
                  <span className="text-xs font-bold text-[var(--mq-text-primary)]">{ret.reason}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-4 space-y-3">
                {ret.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-[var(--mq-border)]/50 last:border-0">
                    <div>
                      <span className="font-semibold text-[var(--mq-text-primary)]">{item.orderItem.productName}</span>
                      <span className="text-[var(--mq-text-muted)] ml-2">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-[var(--mq-text-primary)]">
                      ৳{Number(item.orderItem.unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {ret.customerNote && (
                <div className="p-3 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-xs text-[var(--mq-text-muted)]">
                  <strong>Customer Note:</strong> {ret.customerNote}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
