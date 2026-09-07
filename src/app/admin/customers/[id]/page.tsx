'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { User, Mail, Phone, MapPin, ShoppingBag, RotateCcw, Star, ChevronLeft, Loader2 } from 'lucide-react';

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/customers/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomer(data.customer);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-2" />
        <span>Loading customer profile...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-12 text-center text-slate-400">
        <p className="text-lg font-bold text-white mb-4">Customer Not Found</p>
        <Link href="/admin/customers" className="text-emerald-400 text-xs hover:underline">
          ← Back to Customer Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Customers Directory</span>
      </Link>

      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
            {customer.firstName?.[0] || 'C'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{customer.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1 font-mono">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {customer.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> {customer.phone || 'No phone'}
              </span>
            </div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Account Status: {customer.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Orders */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Order History ({customer.orders?.length || 0})</span>
          </h2>

          <div className="space-y-3">
            {customer.orders?.length > 0 ? (
              customer.orders.map((o: any) => (
                <div key={o.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <Link href={`/admin/orders/${o.id}`} className="font-mono font-bold text-emerald-400 hover:underline">
                      {o.orderNumber}
                    </Link>
                    <p className="text-[10px] text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                    {o.status}
                  </span>
                  <span className="font-bold text-white">৳{o.grandTotal.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-4">No order history recorded for this customer.</p>
            )}
          </div>
        </div>

        {/* Customer Addresses */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Saved Addresses ({customer.addresses?.length || 0})</span>
          </h2>

          <div className="space-y-3">
            {customer.addresses?.length > 0 ? (
              customer.addresses.map((a: any) => (
                <div key={a.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-white">{a.recipientName} ({a.label || 'Home'})</p>
                  <p>{a.addressLine1}</p>
                  <p>{a.city}, {a.postalCode}</p>
                  <p className="text-slate-500 font-mono text-[10px]">{a.phone}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-4">No saved addresses on file.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
