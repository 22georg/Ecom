'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, MapPin, CreditCard, ShoppingBag, ArrowRight, Printer, AlertCircle, Loader2 } from 'lucide-react';

export default function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  const { orderNumber } = params;
  const searchParams = useSearchParams();
  const guestToken = searchParams.get('token');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenQuery = guestToken ? `?token=${guestToken}` : '';
    fetch(`/api/orders/${orderNumber}${tokenQuery}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setOrder(json.data);
        } else {
          setError(json.message || 'Order not found');
        }
      })
      .catch((err) => setError(err.message || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [orderNumber, guestToken]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--mq-primary)] animate-spin mb-4" />
        <p className="text-sm font-semibold text-[var(--mq-text-muted)]">Retrieving your order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--mq-text-primary)] mb-2">Unable to load order</h2>
        <p className="text-sm text-[var(--mq-text-muted)] mb-6">{error || 'The requested order reference does not exist or you do not have permission to view it.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--mq-primary)] text-white font-bold rounded-xl"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--mq-background)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Success Banner */}
        <div className="bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-3xl p-8 shadow-sm text-center mb-8 relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-[var(--mq-accent-emerald)]/10 text-[var(--mq-accent-emerald)] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>

          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[var(--mq-accent-emerald)] px-3 py-1 bg-[var(--mq-accent-emerald)]/10 rounded-full mb-3">
            Transaction Confirmed
          </span>

          <h1 className="text-3xl font-black text-[var(--mq-text-primary)] mb-2">Thank You for Your Order!</h1>
          <p className="text-sm text-[var(--mq-text-muted)] max-w-lg mx-auto mb-6">
            Your order has been received and is being prepared by our fulfillment team. A confirmation message has been recorded.
          </p>

          <div className="inline-flex items-center gap-3 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-2xl px-5 py-3 text-sm">
            <span className="text-[var(--mq-text-muted)]">Order Reference:</span>
            <span className="font-mono font-bold text-[var(--mq-primary)] text-base">{order.orderNumber}</span>
          </div>
        </div>

        {/* Status Badges & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Order Status Card */}
          <div className="bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-[var(--mq-primary)]" />
              <span className="text-xs font-bold uppercase text-[var(--mq-text-muted)] tracking-wider">Order Status</span>
            </div>
            <p className="font-extrabold text-lg text-[var(--mq-text-primary)]">{order.status}</p>
            <p className="text-xs text-[var(--mq-text-muted)] mt-1">Fulfillment: {order.fulfillmentStatus}</p>
          </div>

          {/* Payment Status Card */}
          <div className="bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-[var(--mq-primary)]" />
              <span className="text-xs font-bold uppercase text-[var(--mq-text-muted)] tracking-wider">Payment Status</span>
            </div>
            <p className="font-extrabold text-lg text-[var(--mq-text-primary)]">{order.paymentStatus}</p>
            <p className="text-xs text-[var(--mq-text-muted)] mt-1">Method: {order.payments?.[0]?.provider || 'COD'}</p>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-[var(--mq-primary)]" />
              <span className="text-xs font-bold uppercase text-[var(--mq-text-muted)] tracking-wider">Delivery Details</span>
            </div>
            <p className="font-semibold text-sm text-[var(--mq-text-primary)]">{order.shippingName}</p>
            <p className="text-xs text-[var(--mq-text-muted)] truncate">{order.shippingAddress}</p>
          </div>
        </div>

        {/* Order Items Workspace */}
        <div className="bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-[var(--mq-text-primary)] mb-4 pb-3 border-b border-[var(--mq-border)]">
            Purchased Items ({order.items.length})
          </h2>

          <div className="divide-y divide-[var(--mq-border)]">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-4 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl bg-[var(--mq-background)] border border-[var(--mq-border)] overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[var(--mq-text-muted)]">IMG</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-[var(--mq-text-primary)] truncate">{item.productName}</h3>
                  <p className="text-xs text-[var(--mq-text-muted)] mt-0.5">{item.variantTitle || `SKU: ${item.sku}`}</p>
                  <p className="text-xs text-[var(--mq-text-muted)] mt-1">
                    Qty: {item.quantity} × ৳{Number(item.unitPrice).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-sm text-[var(--mq-text-primary)]">
                    ৳{Number(item.lineTotal).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Summary */}
          <div className="mt-6 pt-4 border-t border-[var(--mq-border)] space-y-2 text-xs max-w-xs ml-auto">
            <div className="flex justify-between text-[var(--mq-text-muted)]">
              <span>Subtotal</span>
              <span className="font-semibold text-[var(--mq-text-primary)]">৳{Number(order.subtotal).toLocaleString()}</span>
            </div>
            {Number(order.discountTotal) > 0 && (
              <div className="flex justify-between text-[var(--mq-accent-emerald)] font-medium">
                <span>Total Discount</span>
                <span>-৳{Number(order.discountTotal).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[var(--mq-text-muted)]">
              <span>Shipping Fee</span>
              <span className="font-semibold text-[var(--mq-text-primary)]">
                {Number(order.shippingTotal) === 0 ? 'FREE' : `৳${Number(order.shippingTotal).toLocaleString()}`}
              </span>
            </div>
            {Number(order.taxTotal) > 0 && (
              <div className="flex justify-between text-[var(--mq-text-muted)]">
                <span>Tax</span>
                <span className="font-semibold text-[var(--mq-text-primary)]">৳{Number(order.taxTotal).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-[var(--mq-border)] text-sm font-bold text-[var(--mq-text-primary)]">
              <span>Grand Total</span>
              <span className="text-lg text-[var(--mq-primary)] font-black">৳{Number(order.grandTotal).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-5 py-2.5 bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-xl text-xs font-semibold text-[var(--mq-text-primary)] hover:bg-[var(--mq-background)] flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {order.customerId && (
              <Link
                href="/account"
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-xl text-xs font-semibold text-[var(--mq-text-primary)] text-center hover:bg-[var(--mq-background)]"
              >
                View Account Orders
              </Link>
            )}
            <Link
              href="/"
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-[var(--mq-primary)] hover:bg-[var(--mq-primary-dark)] text-white font-bold rounded-xl text-xs text-center flex items-center justify-center gap-2"
            >
              Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
