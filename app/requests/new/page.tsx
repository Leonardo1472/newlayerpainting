'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

function NewRequestContent() {
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
    title: '',
    description: '',
    requestDate: new Date().toISOString().split('T')[0],
    requestTime: '09:00',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create request');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">New Request - Select Customer</h1>

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
                Continue to Request
              </button>
              <Link href="/requests" className="btn-secondary">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">New Request</h1>

        <div className="bg-white rounded shadow p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Kitchen Remodeling"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Details about the request..."
                className="input-field h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Date *
                </label>
                <input
                  type="date"
                  name="requestDate"
                  value={form.requestDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Time *
                </label>
                <input
                  type="time"
                  name="requestTime"
                  value={form.requestTime}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creating...' : 'Create Request'}
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

export default function NewRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <NewRequestContent />
    </Suspense>
  );
}
