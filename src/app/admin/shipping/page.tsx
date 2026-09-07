'use client';

import React from 'react';
import { Truck, CheckCircle } from 'lucide-react';

export default function AdminShippingPage() {
  const shippingMethods = [
    { id: '1', name: 'Standard Delivery (Inside Dhaka)', code: 'STD_DHAKA', fee: '৳60.00', eta: '2 - 3 Days', status: 'Active' },
    { id: '2', name: 'Standard Delivery (Outside Dhaka)', code: 'STD_OUTSIDE', fee: '৳120.00', eta: '3 - 5 Days', status: 'Active' },
    { id: '3', name: 'Express Priority Courier', code: 'EXP_PRIORITY', fee: '৳250.00', eta: '24 Hours Guaranteed', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Shipping & Logistics Configuration</h1>
        <p className="text-sm text-slate-400">
          Configure regional shipping zones, delivery rate tiers, and partner carrier integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shippingMethods.map((m) => (
          <div key={m.id} className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {m.status}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">{m.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Code: {m.code}</p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Fixed Rate:</span>
              <span className="font-bold text-emerald-400 text-sm font-mono">{m.fee}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Estimated Delivery:</span>
              <span className="text-slate-200 font-semibold">{m.eta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
