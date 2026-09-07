'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import { MapPin, Plus, Edit, Trash2, Home, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Address {
  id: string;
  label?: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShip: boolean;
  isDefaultBill: boolean;
}

export default function AddressesPage() {
  const { addToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [label, setLabel] = useState('Home');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefaultShip, setIsDefaultShip] = useState(false);
  const [isDefaultBill, setIsDefaultBill] = useState(false);

  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/account/addresses');
      const data = await res.json();
      if (data.addresses) setAddresses(data.addresses);
    } catch (err) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setLabel('Home');
    setRecipientName('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('Dhaka');
    setState('Dhaka Division');
    setPostalCode('1213');
    setIsDefaultShip(addresses.length === 0);
    setIsDefaultBill(addresses.length === 0);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingId(addr.id);
    setLabel(addr.label || 'Home');
    setRecipientName(addr.recipientName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setIsDefaultShip(addr.isDefaultShip);
    setIsDefaultBill(addr.isDefaultBill);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    const payload = {
      label,
      recipientName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country: 'BD',
      isDefaultShip,
      isDefaultBill,
    };

    try {
      const url = editingId ? `/api/account/addresses/${editingId}` : '/api/account/addresses';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to save address.');
        setIsSaving(false);
        return;
      }

      addToast({
        type: 'success',
        title: editingId ? 'Address Updated' : 'Address Added',
        description: 'Your saved addresses have been updated.',
      });

      setIsModalOpen(false);
      setIsSaving(false);
      fetchAddresses();
    } catch (err) {
      setFormError('Network error. Failed to save address.');
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast({ type: 'info', title: 'Address Deleted' });
        fetchAddresses();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to delete address' });
    }
  };

  return (
    <div className="flex flex-col gap-6 mq-animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--mq-text-primary)]">
            Saved Addresses
          </h1>
          <p className="text-xs text-[var(--mq-text-secondary)] mt-1">
            Manage your shipping and billing delivery destinations.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add New Address
        </Button>
      </div>

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <Card variant="default" className="p-8 text-center flex flex-col items-center gap-3">
          <div className="p-3 bg-[var(--mq-surface-muted)] rounded-full text-[var(--mq-secondary)]">
            <MapPin className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-base text-[var(--mq-text-primary)]">No Saved Addresses</h4>
          <p className="text-xs text-[var(--mq-text-secondary)] max-w-sm">
            Add a default shipping address for faster checkout on future orders.
          </p>
          <Button variant="outline" size="sm" onClick={handleOpenAdd} className="mt-2">
            Create First Address
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <Card key={addr.id} variant="default" className="p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--mq-text-primary)]">{addr.label || 'Address'}</span>
                    {addr.isDefaultShip && <Badge variant="success">Default Shipping</Badge>}
                    {addr.isDefaultBill && <Badge variant="primary">Default Billing</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(addr)} aria-label="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(addr.id)} aria-label="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 text-xs text-[var(--mq-text-secondary)] mt-3">
                  <span className="font-semibold text-[var(--mq-text-primary)]">{addr.recipientName}</span>
                  <span>{addr.phone}</span>
                  <span>{addr.addressLine1}</span>
                  {addr.addressLine2 && <span>{addr.addressLine2}</span>}
                  <span>{addr.city}, {addr.state} {addr.postalCode}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Address' : 'Add New Delivery Address'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {formError && <Alert variant="error">{formError}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Address Label"
              placeholder="Home, Office, Warehouse"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Input
              label="Recipient Name"
              placeholder="Alex Rahman"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+8801700000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="City"
              placeholder="Dhaka"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <Input
            label="Address Line 1"
            placeholder="House 42, Road 11, Block B, Banani"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            required
          />

          <Input
            label="Address Line 2 (Optional)"
            placeholder="Apartment or Suite number"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="State / District"
              placeholder="Dhaka Division"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
            <Input
              label="Postal Code"
              placeholder="1213"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--mq-border)]">
            <Checkbox
              label="Set as Default Shipping Address"
              checked={isDefaultShip}
              onChange={(e) => setIsDefaultShip(e.target.checked)}
            />
            <Checkbox
              label="Set as Default Billing Address"
              checked={isDefaultBill}
              onChange={(e) => setIsDefaultBill(e.target.checked)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--mq-border)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
