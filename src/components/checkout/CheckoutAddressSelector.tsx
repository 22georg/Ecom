'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, User, Mail, Phone, Plus, Check } from 'lucide-react';

export interface CheckoutAddressData {
  guestEmail?: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  billingName?: string;
  billingAddress?: string;
}

interface Props {
  isGuest: boolean;
  value: CheckoutAddressData;
  onChange: (data: CheckoutAddressData) => void;
}

export const CheckoutAddressSelector: React.FC<Props> = ({ isGuest, value, onChange }) => {
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(isGuest);

  useEffect(() => {
    if (!isGuest) {
      setLoading(true);
      fetch('/api/account/addresses')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data.length > 0) {
            setSavedAddresses(json.data);
            const defaultAddr = json.data.find((a: any) => a.isDefaultShip) || json.data[0];
            setSelectedAddressId(defaultAddr.id);
            applySavedAddress(defaultAddr);
          } else {
            setShowCustomForm(true);
          }
        })
        .catch(() => setShowCustomForm(true))
        .finally(() => setLoading(false));
    }
  }, [isGuest]);

  const applySavedAddress = (addr: any) => {
    onChange({
      ...value,
      shippingName: addr.recipientName,
      shippingPhone: addr.phone,
      shippingAddress: addr.addressLine1 + (addr.addressLine2 ? `, ${addr.addressLine2}` : ''),
      shippingCity: addr.city,
      shippingState: addr.state,
      shippingPostalCode: addr.postalCode,
      shippingCountry: addr.country,
    });
  };

  const handleSelectSaved = (addr: any) => {
    setSelectedAddressId(addr.id);
    setShowCustomForm(false);
    applySavedAddress(addr);
  };

  return (
    <div className="bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--mq-border)]">
        <div className="w-10 h-10 rounded-xl bg-[var(--mq-primary-light)] text-[var(--mq-primary)] flex items-center justify-center font-bold text-lg">
          1
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--mq-text-primary)]">Contact & Shipping Address</h2>
          <p className="text-sm text-[var(--mq-text-muted)]">Where should we deliver your order?</p>
        </div>
      </div>

      {/* Guest Email Field */}
      {isGuest && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[var(--mq-text-primary)] mb-2">
            Email Address <span className="text-[var(--mq-accent-coral)]">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mq-text-muted)]" />
            <input
              type="email"
              required
              value={value.guestEmail || ''}
              onChange={(e) => onChange({ ...value, guestEmail: e.target.value })}
              placeholder="customer@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-sm text-[var(--mq-text-primary)] focus:outline-none focus:border-[var(--mq-primary)] transition"
            />
          </div>
          <p className="text-xs text-[var(--mq-text-muted)] mt-1.5">
            We will send order status and digital receipt to this email.
          </p>
        </div>
      )}

      {/* Authenticated Saved Address Cards */}
      {!isGuest && savedAddresses.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[var(--mq-text-primary)] mb-3">
            Select Saved Address
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id && !showCustomForm;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectSaved(addr)}
                  className={`cursor-pointer rounded-xl border p-4 transition relative ${
                    isSelected
                      ? 'border-[var(--mq-primary)] bg-[var(--mq-primary-light)]/20 shadow-sm'
                      : 'border-[var(--mq-border)] hover:border-[var(--mq-text-muted)] bg-[var(--mq-background)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--mq-surface)] border border-[var(--mq-border)] mb-2 text-[var(--mq-text-primary)]">
                        {addr.label || 'Saved Address'}
                      </span>
                      <p className="font-semibold text-sm text-[var(--mq-text-primary)]">{addr.recipientName}</p>
                      <p className="text-xs text-[var(--mq-text-muted)] mt-0.5">{addr.phone}</p>
                      <p className="text-xs text-[var(--mq-text-primary)] mt-2 line-clamp-2">
                        {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[var(--mq-primary)] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCustomForm(!showCustomForm);
              if (!showCustomForm) setSelectedAddressId(null);
            }}
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--mq-primary)] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            {showCustomForm ? 'Use a saved address instead' : 'Deliver to a different address'}
          </button>
        </div>
      )}

      {/* Manual / Guest Form */}
      {(showCustomForm || isGuest) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-1.5">
              Recipient Name <span className="text-[var(--mq-accent-coral)]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mq-text-muted)]" />
              <input
                type="text"
                required
                value={value.shippingName}
                onChange={(e) => onChange({ ...value, shippingName: e.target.value })}
                placeholder="Full Name"
                className="w-full pl-9 pr-3 py-2 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-sm text-[var(--mq-text-primary)] focus:outline-none focus:border-[var(--mq-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-1.5">
              Phone Number <span className="text-[var(--mq-accent-coral)]">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mq-text-muted)]" />
              <input
                type="tel"
                required
                value={value.shippingPhone}
                onChange={(e) => onChange({ ...value, shippingPhone: e.target.value })}
                placeholder="+880 1700 000000"
                className="w-full pl-9 pr-3 py-2 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-sm text-[var(--mq-text-primary)] focus:outline-none focus:border-[var(--mq-primary)]"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-1.5">
              Full Street Address <span className="text-[var(--mq-accent-coral)]">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-[var(--mq-text-muted)]" />
              <textarea
                required
                rows={2}
                value={value.shippingAddress}
                onChange={(e) => onChange({ ...value, shippingAddress: e.target.value })}
                placeholder="House/Apartment, Road, Area, Landmark"
                className="w-full pl-9 pr-3 py-2 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-sm text-[var(--mq-text-primary)] focus:outline-none focus:border-[var(--mq-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-1.5">City / Locality</label>
            <input
              type="text"
              value={value.shippingCity || ''}
              onChange={(e) => onChange({ ...value, shippingCity: e.target.value })}
              placeholder="e.g. Dhaka, Chittagong"
              className="w-full px-3 py-2 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-sm text-[var(--mq-text-primary)] focus:outline-none focus:border-[var(--mq-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--mq-text-primary)] mb-1.5">Postal Code</label>
            <input
              type="text"
              value={value.shippingPostalCode || ''}
              onChange={(e) => onChange({ ...value, shippingPostalCode: e.target.value })}
              placeholder="e.g. 1207"
              className="w-full px-3 py-2 bg-[var(--mq-background)] border border-[var(--mq-border)] rounded-xl text-sm text-[var(--mq-text-primary)] focus:outline-none focus:border-[var(--mq-primary)]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
