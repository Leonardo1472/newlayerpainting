'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(customerId || '');
  const [showCustomerStep, setShowCustomerStep] = useState(!customerId);

  const [form, setForm] = useState({
    customerId: customerId || '',
    subtotal: 0,
    discountType: 'fixed',
    discountValue: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
  });

  // Load customers on mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      } catch (err) {
        console.error('Failed to load customers');
      }
    };
    loadCustomers();
  }, []);

  const handleSelectCustomer = () => {
    if (selectedCustomer) {
      setForm(prev => ({ ...prev, customerId: selectedCustomer }));
      setShowCustomerStep(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name.includes('Value') || name.includes('Rate') || name.includes('Subtotal') || name.includes('Tax') ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.customerId) {
        setError('Customer is required');
        setLoading(false);
        return;
      }

      // Generate unique invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          invoiceNumber,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create invoice');
        return;
      }

      router.push(`/customers/${form.customerId}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If no customer selected, show customer selector first
  if (showCustomerStep) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Navigation />

        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">New Invoice - Select Customer</h1>

          <div className="bg-white rounded shadow p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Customer *
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="input-field"
              >
                <option value="">Choose a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSelectCustomer}
                disabled={!selectedCustomer}
                className="btn-primary"
              >
                Continue to Invoice
              </button>
              <Link href="/invoices" className="btn-secondary">
                Cancel
              </Link>
            </div>

            {customers.length === 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded text-sm text-blue-700">
                No customers found. <Link href="/customers/new" className="underline font-medium">Create a customer first</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">New Invoice</h1>

        <div className="bg-white rounded shadow p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtotal ($)
              </label>
              <input
                type="number"
                name="subtotal"
                value={form.subtotal}
                onChange={handleChange}
                step="0.01"
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  name="taxRate"
                  value={form.taxRate}
                  onChange={handleChange}
                  step="0.01"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="fixed">Fixed Amount ($)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value
              </label>
              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                step="0.01"
                className="input-field"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creating...' : 'Create Invoice'}
              </button>
              <Link href={`/customers/${form.customerId}`} className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <NewInvoiceContent />
    </Suspense>
  );
}
