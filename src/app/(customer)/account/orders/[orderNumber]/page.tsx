'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Printer,
  RotateCcw,
  Star,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ReviewSubmissionModal } from '@/components/pdp/ReviewSubmissionModal';
import { useToast } from '@/components/ui/Toast';

export default function OrderDetailsPage({ params }: { params: { orderNumber: string } }) {
  const { orderNumber } = params;
  const router = useRouter();
  const { addToast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [cancelling, setCancelling] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('DAMAGED');
  const [returnNote, setReturnNote] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Review modal state
  const [reviewItem, setReviewItem] = useState<{ productId: string; name: string; orderItemId: string } | null>(null);

  const fetchOrderDetails = () => {
    setLoading(true);
    fetch(`/api/orders/${orderNumber}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setOrder(json.data);
        } else {
          setError(json.message || 'Order not found');
        }
      })
      .catch((err) => setError(err.message || 'Network error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNumber]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order? Stock will be released.')) return;
    setCancelling(true);

    try {
      const res = await fetch(`/api/account/orders/${orderNumber}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer requested cancellation from account portal' }),
      });

      const json = await res.json();
      if (json.success) {
        addToast({ type: 'success', title: 'Order Cancelled', description: json.message });
        fetchOrderDetails();
      } else {
        addToast({ type: 'error', title: 'Cancellation Failed', description: json.message });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', description: err.message });
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || order.items.length === 0) return;
    setReturnSubmitting(true);

    try {
      const res = await fetch('/api/account/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          reason: returnReason,
          customerNote: returnNote,
          items: order.items.map((i: any) => ({
            orderItemId: i.id,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const json = await res.json();
      if (json.success) {
        addToast({ type: 'success', title: 'Return Request Submitted', description: json.message });
        setShowReturnModal(false);
        router.push('/account/returns');
      } else {
        addToast({ type: 'error', title: 'Return Failed', description: json.message });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', description: err.message });
    } finally {
      setReturnSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--mq-primary)] animate-spin mb-4" />
        <p className="text-sm font-semibold text-[var(--mq-text-muted)]">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[var(--mq-text-primary)] mb-2">Order Not Found</h2>
        <p className="text-xs text-[var(--mq-text-muted)] mb-6">{error || 'The requested order does not exist or access is unauthorized.'}</p>
        <Link href="/account/orders" className="px-5 py-2.5 bg-[var(--mq-primary)] text-white text-xs font-bold rounded-xl">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isEligibleForCancel = ['PENDING', 'PROCESSING'].includes(order.status);
  const isEligibleForReturn = order.status === 'DELIVERED';

  return (
    <div className="flex flex-col gap-6 mq-animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--mq-border)]">
        <div>
          <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-xs text-[var(--mq-primary)] font-semibold hover:underline mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black font-display text-[var(--mq-text-primary)]">Order #{order.orderNumber}</h1>
            <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'error' : 'info'} size="sm">
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-[var(--mq-text-muted)] mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-[var(--mq-surface)] border border-[var(--mq-border)] text-xs font-semibold text-[var(--mq-text-primary)] rounded-xl hover:bg-[var(--mq-background)] flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Invoice
          </button>

          {isEligibleForCancel && (
            <button
              disabled={cancelling}
              onClick={handleCancelOrder}
              className="px-3.5 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold rounded-xl hover:bg-rose-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Cancel Order
            </button>
          )}

          {isEligibleForReturn && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="px-3.5 py-2 bg-[var(--mq-primary-light)] text-[var(--mq-primary)] border border-[var(--mq-primary)]/30 text-xs font-semibold rounded-xl hover:bg-[var(--mq-primary)] hover:text-white transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Request Return
            </button>
          )}
        </div>
      </div>

      {/* Shipment Status Progression Bar */}
      <Card variant="default" className="p-6">
        <h3 className="text-sm font-bold text-[var(--mq-text-primary)] mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[var(--mq-primary)]" /> Shipment Progression Timeline
        </h3>

        {order.status === 'CANCELLED' ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>This order was cancelled. Stock has been returned to inventory.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
            {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((stepStatus, idx) => {
              const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
              const currentIdx = statusOrder.indexOf(order.status);
              const stepIdx = statusOrder.indexOf(stepStatus);
              const isCompleted = currentIdx >= stepIdx;

              return (
                <div key={stepStatus} className="flex flex-col items-center text-center p-3 rounded-xl bg-[var(--mq-background)] border border-[var(--mq-border)]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition ${
                      isCompleted ? 'bg-[var(--mq-accent-emerald)] text-white' : 'bg-[var(--mq-surface)] text-[var(--mq-text-muted)] border border-[var(--mq-border)]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-xs font-bold text-[var(--mq-text-primary)] uppercase">{stepStatus}</span>
                  <span className="text-[10px] text-[var(--mq-text-muted)] mt-0.5">
                    {isCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="default" className="p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--mq-text-muted)] mb-3">
            <MapPin className="w-4 h-4 text-[var(--mq-primary)]" /> Delivery Address Snapshot
          </div>
          <p className="font-bold text-sm text-[var(--mq-text-primary)]">{order.shippingName}</p>
          <p className="text-xs text-[var(--mq-text-muted)] mt-0.5">{order.shippingPhone}</p>
          <p className="text-xs text-[var(--mq-text-primary)] mt-2">{order.shippingAddress}</p>
        </Card>

        <Card variant="default" className="p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--mq-text-muted)] mb-3">
            <CreditCard className="w-4 h-4 text-[var(--mq-primary)]" /> Payment Details
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--mq-text-muted)]">Payment Provider</span>
            <span className="text-xs font-bold text-[var(--mq-text-primary)]">{order.payments?.[0]?.provider || 'COD'}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--mq-text-muted)]">Payment Status</span>
            <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
              {order.paymentStatus}
            </Badge>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--mq-border)]">
            <span className="text-xs text-[var(--mq-text-muted)]">Total Paid</span>
            <span className="font-extrabold text-sm text-[var(--mq-primary)]">৳{Number(order.grandTotal).toLocaleString()}</span>
          </div>
        </Card>
      </div>

      {/* Order Items Workspace */}
      <Card variant="default" className="p-6">
        <h3 className="text-sm font-bold text-[var(--mq-text-primary)] mb-4 pb-3 border-b border-[var(--mq-border)]">
          Ordered Items ({order.items.length})
        </h3>

        <div className="divide-y divide-[var(--mq-border)]">
          {order.items.map((item: any) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-14 h-14 rounded-xl bg-[var(--mq-background)] border border-[var(--mq-border)] overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[var(--mq-text-muted)]">IMG</div>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-[var(--mq-text-primary)] truncate">{item.productName}</h4>
                  <p className="text-[11px] text-[var(--mq-text-muted)]">{item.variantTitle || `SKU: ${item.sku}`}</p>
                  <p className="text-xs text-[var(--mq-text-muted)] mt-1">
                    Qty: {item.quantity} × ৳{Number(item.unitPrice).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="font-extrabold text-sm text-[var(--mq-text-primary)]">
                  ৳{Number(item.lineTotal).toLocaleString()}
                </span>

                {item.variant?.productId && (
                  <button
                    onClick={() =>
                      setReviewItem({
                        productId: item.variant.productId,
                        name: item.productName,
                        orderItemId: item.id,
                      })
                    }
                    className="px-3 py-1.5 bg-[var(--mq-surface)] border border-[var(--mq-border)] hover:bg-[var(--mq-primary-light)] hover:border-[var(--mq-primary)] text-xs font-semibold text-[var(--mq-text-primary)] rounded-lg transition flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Write Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Financial Breakdown */}
        <div className="mt-6 pt-4 border-t border-[var(--mq-border)] space-y-2 text-xs max-w-xs ml-auto">
          <div className="flex justify-between text-[var(--mq-text-muted)]">
            <span>Subtotal</span>
            <span className="font-semibold text-[var(--mq-text-primary)]">৳{Number(order.subtotal).toLocaleString()}</span>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div className="flex justify-between text-[var(--mq-accent-emerald)] font-medium">
              <span>Total Savings</span>
              <span>-৳{Number(order.discountTotal).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[var(--mq-text-muted)]">
            <span>Shipping</span>
            <span className="font-semibold text-[var(--mq-text-primary)]">
              {Number(order.shippingTotal) === 0 ? 'FREE' : `৳${Number(order.shippingTotal).toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-[var(--mq-border)] text-sm font-bold text-[var(--mq-text-primary)]">
            <span>Grand Total</span>
            <span className="text-lg text-[var(--mq-primary)] font-black">৳{Number(order.grandTotal).toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative mq-animate-scale-in">
            <h3 className="text-lg font-bold text-[var(--mq-text-primary)] mb-2">Request Order Return</h3>
            <p className="text-xs text-[var(--mq-text-muted)] mb-4">
              Returns are evaluated under MARQIVO's 14-day policy. Select reason and details.
            </p>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-xs text-[var(--mq-text-primary)] focus:outline-none"
                >
                  <option value="DAMAGED">Damaged during delivery</option>
                  <option value="DEFECTIVE">Product defective / not working</option>
                  <option value="WRONG_ITEM">Received wrong item</option>
                  <option value="WRONG_SIZE">Wrong size or color</option>
                  <option value="NOT_AS_DESCRIBED">Item not as described</option>
                  <option value="CHANGED_MIND">Changed my mind</option>
                  <option value="OTHER">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-1">Detailed Explanation</label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Provide additional details regarding your return request..."
                  className="w-full px-3 py-2 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-xs text-[var(--mq-text-primary)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--mq-border)]">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 bg-[var(--mq-surface)] border border-[var(--mq-border)] text-xs font-semibold text-[var(--mq-text-primary)] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  className="px-5 py-2 bg-[var(--mq-primary)] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  {returnSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewItem && (
        <ReviewSubmissionModal
          productId={reviewItem.productId}
          productName={reviewItem.name}
          orderItemId={reviewItem.orderItemId}
          isOpen={Boolean(reviewItem)}
          onClose={() => setReviewItem(null)}
          onSuccess={() => fetchOrderDetails()}
        />
      )}
    </div>
  );
}
