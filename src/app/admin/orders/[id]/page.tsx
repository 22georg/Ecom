'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShoppingBag,
  Truck,
  User,
  MapPin,
  Printer,
  ChevronLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  PlusCircle,
  X,
  CreditCard,
} from 'lucide-react';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shipment Modal State
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [carrier, setCarrier] = useState('Pathao Express');
  const [trackingNumber, setTrackingNumber] = useState(`PTH-${Math.floor(100000 + Math.random() * 900000)}`);

  const fetchOrderDetail = () => {
    setLoading(true);
    fetch(`/api/admin/orders/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.order);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STATUS', status: newStatus }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Status update failed');
      fetchOrderDetail();
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_SHIPMENT', carrier, trackingNumber }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Shipment registration failed');

      setShowShipmentModal(false);
      fetchOrderDetail();
    } catch (err: any) {
      setError(err.message || 'Shipment creation failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-2" />
        <span>Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-12 text-center text-slate-400">
        <p className="text-lg font-bold text-white mb-4">Order Not Found</p>
        <Link href="/admin/orders" className="text-emerald-400 text-xs hover:underline">
          ← Back to Orders Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Order Directory</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors print:hidden"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Summary Top Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-extrabold text-emerald-400">{order.orderNumber}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {order.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        {/* Order Lifecycle Triggers */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {order.status === 'PENDING' && (
            <button
              onClick={() => handleStatusUpdate('PROCESSING')}
              disabled={updating}
              className="px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
            >
              Mark Processing
            </button>
          )}
          {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
            <button
              onClick={() => setShowShipmentModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>Create Shipment</span>
            </button>
          )}
          {order.status === 'SHIPPED' && (
            <button
              onClick={() => handleStatusUpdate('DELIVERED')}
              disabled={updating}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              Mark Delivered
            </button>
          )}
          {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
            <button
              onClick={() => handleStatusUpdate('CANCELLED')}
              disabled={updating}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items Snapshot */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white mb-4">Purchased Items</h2>

            <div className="divide-y divide-slate-800/80">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800" />
                    )}
                    <div>
                      <p className="font-bold text-slate-200">{item.productName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">SKU: {item.sku} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-bold text-white">৳{item.lineTotal.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500">৳{item.unitPrice.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">৳{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promotional Discount:</span>
                  <span className="font-mono">-৳{order.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-mono">৳{order.shippingTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-400">৳{order.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipment Tracking Info */}
          {order.shipments?.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Shipments ({order.shipments.length})</span>
              </h2>

              <div className="space-y-3">
                {order.shipments.map((s: any) => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-200">{s.carrier}</p>
                      <p className="text-[11px] text-emerald-400 font-mono">Tracking #: {s.trackingNumber}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer & Address Details */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 text-xs">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Customer Details</span>
            </h2>

            <div>
              <p className="font-bold text-white text-sm">{order.shippingAddress.name}</p>
              <p className="text-slate-400 font-mono">{order.customer?.email || 'Guest Checkout'}</p>
              <p className="text-slate-400 font-mono">{order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 text-xs">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Delivery Address</span>
            </h2>

            <div className="text-slate-300 space-y-1">
              <p className="font-semibold text-white">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p className="text-slate-500">{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Modal */}
      {showShipmentModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button onClick={() => setShowShipmentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Create Shipment & Tracking</h2>
            <p className="text-xs text-slate-400 mb-6">Assign logistics carrier and tracking reference.</p>

            <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Carrier *</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="Pathao Express">Pathao Express</option>
                  <option value="RedX Logistics">RedX Logistics</option>
                  <option value="Steadfast Courier">Steadfast Courier</option>
                  <option value="DHL Worldwide">DHL Worldwide Express</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Tracking Number *</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowShipmentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Register Shipment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
