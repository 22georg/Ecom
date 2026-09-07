'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, AlertCircle, ShoppingBag, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CheckoutAddressSelector, CheckoutAddressData } from '@/components/checkout/CheckoutAddressSelector';
import { CheckoutShippingSelector, ShippingMethodOption } from '@/components/checkout/CheckoutShippingSelector';
import { CheckoutPaymentSelector } from '@/components/checkout/CheckoutPaymentSelector';
import { CheckoutSummaryPanel } from '@/components/checkout/CheckoutSummaryPanel';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading: cartLoading, selectShippingMethod, refreshCart } = useCart();

  const [isGuest, setIsGuest] = useState(true);
  const [addressData, setAddressData] = useState<CheckoutAddressData>({
    guestEmail: '',
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: 'Dhaka',
    shippingState: 'Dhaka',
    shippingPostalCode: '1207',
    shippingCountry: 'BD',
  });

  const [shippingOptions, setShippingOptions] = useState<ShippingMethodOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<string>('COD');
  const [notes, setNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Check auth session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setIsGuest(false);
          setAddressData((prev) => ({
            ...prev,
            shippingName: `${json.data.firstName || ''} ${json.data.lastName || ''}`.trim(),
            shippingPhone: json.data.phone || '',
          }));
        }
      })
      .catch(() => setIsGuest(true));
  }, []);

  // Fetch shipping methods
  useEffect(() => {
    fetch('/api/cart/shipping-methods')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setShippingOptions(json.data);
          if (json.data.length > 0) {
            setSelectedShippingId(cart?.shippingMethodId || json.data[0].id);
          }
        }
      });
  }, [cart?.shippingMethodId]);

  // Pre-validate cart on page entry
  useEffect(() => {
    if (!cartLoading && cart && cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, cartLoading, router]);

  const handleShippingChange = async (methodId: string) => {
    setSelectedShippingId(methodId);
    await selectShippingMethod(methodId);
  };

  const handlePlaceOrder = async () => {
    setErrorMessage(null);
    setWarnings([]);

    if (isGuest && !addressData.guestEmail) {
      setErrorMessage('Please enter your email address for order notifications.');
      return;
    }

    if (!addressData.shippingName || !addressData.shippingPhone || !addressData.shippingAddress) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/checkout/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addressData,
          notes,
          paymentProvider: selectedPaymentProvider,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setErrorMessage(json.message || 'Failed to place order. Please review your cart.');
        setSubmitting(false);
        return;
      }

      await refreshCart();

      const { orderNumber, guestToken, redirectUrl } = json.data;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        const tokenQuery = guestToken ? `?token=${guestToken}` : '';
        router.push(`/order-confirmation/${orderNumber}${tokenQuery}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--mq-primary)] animate-spin mb-4" />
        <p className="text-sm font-semibold text-[var(--mq-text-muted)]">Preparing checkout workspace...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-[var(--mq-text-muted)] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--mq-text-primary)] mb-2">Your cart is empty</h2>
        <p className="text-sm text-[var(--mq-text-muted)] mb-6">Add items to your cart before proceeding to checkout.</p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--mq-primary)] text-white font-bold rounded-xl"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--mq-background)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[var(--mq-text-muted)] mb-6">
          <Link href="/" className="hover:text-[var(--mq-primary)]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/cart" className="hover:text-[var(--mq-primary)]">Shopping Cart</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[var(--mq-text-primary)]">Checkout</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--mq-border)]">
          <div>
            <h1 className="text-3xl font-black text-[var(--mq-text-primary)]">Secure Checkout</h1>
            <p className="text-sm text-[var(--mq-text-muted)] mt-1">Complete your purchase with MARQIVO guaranteed security</p>
          </div>
          <Link
            href="/cart"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-[var(--mq-primary)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Cart
          </Link>
        </div>

        {/* Error Banners */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Checkout Alert</p>
              <p className="text-xs text-rose-600/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Warnings Banner */}
        {warnings.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Inventory Notice</p>
              <ul className="text-xs space-y-1 mt-1">
                {warnings.map((w, idx) => (
                  <li key={idx}>• {w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Checkout Steps Column */}
          <div className="lg:col-span-7 xl:col-span-8">
            <CheckoutAddressSelector
              isGuest={isGuest}
              value={addressData}
              onChange={setAddressData}
            />

            <CheckoutShippingSelector
              options={shippingOptions}
              selectedId={selectedShippingId}
              onSelect={handleShippingChange}
            />

            <CheckoutPaymentSelector
              selectedProvider={selectedPaymentProvider}
              onSelect={setSelectedPaymentProvider}
            />
          </div>

          {/* Right Sticky Order Summary Column */}
          <div className="lg:col-span-5 xl:col-span-4">
            <CheckoutSummaryPanel
              cart={cart}
              submitting={submitting}
              notes={notes}
              onNotesChange={setNotes}
              onSubmitOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
