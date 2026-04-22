'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

function NewQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [nextQuoteNumber, setNextQuoteNumber] = useState<number>(1);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    quoteNumber: '',
    discountType: 'fixed',
    discountValue: '',
    taxRate: 7.5,
    depositType: 'fixed',
    depositAmount: '',
  });
  const [editingQuoteNumber, setEditingQuoteNumber] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', quantity: 1, pricePerUnit: 0 });

  // Load customers and get next quote number on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/quotes');
        if (res.ok) {
          const quotes = await res.json();
          if (quotes.length > 0) {
            const numbers = quotes
              .map((q: any) => {
                const num = parseInt(q.quoteNumber.replace(/\D/g, ''));
                return isNaN(num) ? 0 : num;
              })
              .sort((a: number, b: number) => b - a);
            setNextQuoteNumber(numbers[0] + 1);
          }
        }
      } catch (err) {
        console.error('Failed to load quotes');
      }
    };
    loadData();
  }, []);

  // Load customers on mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
          // Pre-select customer if coming from link
          if (customerId) {
            const customer = data.find((c: any) => c.id === customerId);
            if (customer) {
              setSelectedCustomer(customer);
              const displayName = customer.firstName && customer.lastName
                ? `${customer.firstName} ${customer.lastName}`
                : customer.name || 'Unknown';
              setCustomerSearch(displayName);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load customers');
      }
    };
    loadCustomers();
  }, [customerId]);

  const getCustomerDisplayName = (customer: any) => {
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    }
    return customer.name || 'Unknown';
  };

  const handleCustomerSearch = (value: string) => {
    setCustomerSearch(value);
    if (value.trim()) {
      const filtered = customers.filter(c => {
        const displayName = getCustomerDisplayName(c);
        return displayName.toLowerCase().includes(value.toLowerCase()) ||
          c.email?.toLowerCase().includes(value.toLowerCase()) ||
          c.phone?.includes(value);
      });
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(true);
    } else {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
    }
  };

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerSearch(getCustomerDisplayName(customer));
    setShowCustomerDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name.includes('Rate')
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const addOrUpdateItem = () => {
    if (!newItem.name || !newItem.description || newItem.quantity < 1 || newItem.pricePerUnit < 0) {
      alert('Please fill all item fields');
      return;
    }

    const itemWithTotal = {
      ...newItem,
      total: newItem.quantity * newItem.pricePerUnit,
    };

    if (editingItemIdx !== null) {
      const updatedItems = [...items];
      updatedItems[editingItemIdx] = itemWithTotal;
      setItems(updatedItems);
      setEditingItemIdx(null);
    } else {
      setItems([...items, itemWithTotal]);
    }
    setNewItem({ name: '', description: '', quantity: 1, pricePerUnit: 0 });
  };

  const editItem = (idx: number) => {
    const item = items[idx];
    setNewItem({
      name: item.name || '',
      description: item.description || '',
      quantity: item.quantity || 1,
      pricePerUnit: typeof item.pricePerUnit === 'number' ? item.pricePerUnit : 0,
    });
    setEditingItemIdx(idx);
  };

  const deleteItem = (idx: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const price = typeof item.pricePerUnit === 'number' ? item.pricePerUnit : 0;
    const qty = typeof item.quantity === 'number' ? item.quantity : 1;
    return sum + (price * qty);
  }, 0);
  const discountVal = typeof form.discountValue === 'string' ? parseFloat(form.discountValue) || 0 : form.discountValue;
  const discountAmount = form.discountType === 'fixed'
    ? discountVal
    : (subtotal * discountVal / 100);
  const priceAfterDiscount = subtotal - discountAmount;
  const taxAmount = priceAfterDiscount * (form.taxRate / 100);
  const totalWithTax = priceAfterDiscount + taxAmount;
  const depositVal = typeof form.depositAmount === 'string' ? parseFloat(form.depositAmount) || 0 : form.depositAmount;
  const depositAmountCalculated = form.depositType === 'fixed'
    ? depositVal
    : (totalWithTax * depositVal / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    if (!form.description.trim()) {
      setError('Scope of Work is required');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          title: form.title,
          description: form.description,
          items: items,
          subtotal: subtotal,
          discountType: form.discountType,
          discountValue: discountVal,
          discountAmount: discountAmount,
          taxRate: form.taxRate,
          taxAmount: taxAmount,
          depositType: form.depositType,
          depositAmount: depositAmountCalculated,
          total: totalWithTax,
          quoteNumber: form.quoteNumber || nextQuoteNumber.toString(),
        }),
      });

      if (!res.ok) {
        let errorMsg = 'Failed to create quote';
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          errorMsg = `Server error: ${res.status} ${res.statusText}`;
        }
        setError(errorMsg);
        console.error('API Error:', errorMsg);
        return;
      }

      const newQuote = await res.json();
      router.push(`/quotes/${newQuote.id}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">New Quote</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Quote Header Section */}
          <div className="bg-white rounded shadow p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Kitchen Remodeling"
                className="input-field"
              />
            </div>
          </div>

          {/* Customer Section */}
          <div className="bg-white rounded shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer</h3>
              <Link href="/customers/new" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                + New
              </Link>
            </div>
            <div className="relative mb-3">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => handleCustomerSearch(e.target.value)}
                onFocus={() => customerSearch && setShowCustomerDropdown(true)}
                placeholder="Search customer..."
                className="input-field"
              />
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
                  {filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => selectCustomer(customer)}
                      className="w-full text-left px-4 py-2 hover:bg-cyan-50 border-b last:border-b-0"
                    >
                      <p className="font-medium text-gray-900">{getCustomerDisplayName(customer)}</p>
                      {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div className="p-3 bg-cyan-50 rounded border border-cyan-200">
                <p className="font-medium text-gray-900">{getCustomerDisplayName(selectedCustomer)}</p>
                {selectedCustomer.phone && <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>}
              </div>
            )}
          </div>

          {/* Items Section */}
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>

            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Painting Service"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of item..."
                      className="input-field h-16"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      min="1"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Per Unit ($) *
                    </label>
                    <input
                      type="number"
                      value={newItem.pricePerUnit}
                      onChange={(e) => setNewItem(prev => ({ ...prev, pricePerUnit: parseFloat(e.target.value) || 0 }))}
                      step="0.01"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={addOrUpdateItem}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded transition"
              >
                {editingItemIdx !== null ? 'Update Item' : '+ Add Item'}
              </button>
            </div>

            {items.length > 0 && (
              <div className="mb-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Name</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Description</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">Price</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">Qty</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">Total</th>
                      <th className="text-center py-2 px-2 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const price = typeof item.pricePerUnit === 'number' ? item.pricePerUnit : 0;
                      const qty = typeof item.quantity === 'number' ? item.quantity : 1;
                      const itemTotal = price * qty;
                      return (
                        <tr key={idx} className="border-b">
                          <td className="py-2 px-2 font-medium">{item.name}</td>
                          <td className="py-2 px-2 text-gray-600 text-xs">{item.description}</td>
                          <td className="text-right py-2 px-2">${price.toFixed(2)}</td>
                          <td className="text-right py-2 px-2">{qty}</td>
                          <td className="text-right py-2 px-2 font-medium">${itemTotal.toFixed(2)}</td>
                          <td className="text-center py-2 px-2 flex gap-2 justify-center">
                            <button
                              type="button"
                              onClick={() => editItem(idx)}
                              className="text-blue-600 hover:text-blue-700 text-lg"
                              title="Edit item"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem(idx)}
                              className="text-red-600 hover:text-red-700 text-lg"
                              title="Delete item"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Scope of Work Section */}
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scope of Work *</h3>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the work to be performed..."
              className="input-field h-24"
              required
            />
          </div>

          {/* Pricing Summary Section */}
          {items.length > 0 && (
            <div className="bg-white rounded shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <>
                    <div className="flex justify-between py-2 bg-orange-50 px-2 rounded">
                      <span className="text-gray-600">Discount ({form.discountType === 'fixed' ? '$' : form.discountValue + '%'}):</span>
                      <span className="font-medium text-red-600">-${discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">After Discount:</span>
                      <span className="font-medium">${priceAfterDiscount.toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between py-2 bg-blue-50 px-2 rounded">
                  <span className="text-gray-600">Tax ({form.taxRate}%):</span>
                  <span className="font-medium text-blue-600">+${taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-3 border-b text-lg font-bold">
                  <span>Total (with tax):</span>
                  <span className="text-cyan-600">${totalWithTax.toFixed(2)}</span>
                </div>

                {depositAmountCalculated > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Deposit ({form.depositType === 'fixed' ? '$' : form.depositAmount + '%'}):</span>
                    <span className="font-medium">${depositAmountCalculated.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quote Details Section */}
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Details</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Number
                  </label>
                  {editingQuoteNumber ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="quoteNumber"
                        value={form.quoteNumber}
                        onChange={handleChange}
                        placeholder={nextQuoteNumber.toString()}
                        className="input-field font-medium flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setEditingQuoteNumber(false)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-3 rounded transition"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 bg-gray-50 border border-gray-300 rounded px-4 py-2 font-medium text-gray-900">
                        {form.quoteNumber || nextQuoteNumber}
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingQuoteNumber(true)}
                        className="text-blue-600 hover:text-blue-700 text-lg"
                        title="Edit quote number"
                      >
                        ✎
                      </button>
                    </div>
                  )}
                </div>
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
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Discount {form.discountType === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, discountType: 'fixed' }))}
                        className={`flex-1 py-2 px-3 rounded border-2 font-medium transition ${
                          form.discountType === 'fixed'
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        Fixed ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, discountType: 'percentage' }))}
                        className={`flex-1 py-2 px-3 rounded border-2 font-medium transition ${
                          form.discountType === 'percentage'
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        Percentage (%)
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="discountValue"
                        value={form.discountValue}
                        onChange={handleChange}
                        step="0.01"
                        placeholder={form.discountType === 'percentage' ? '0%' : '$0'}
                        className="input-field flex-1"
                      />
                      <span className="flex items-center px-3 bg-gray-50 border border-gray-300 rounded text-gray-600 font-medium">
                        {form.discountType === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Deposit Amount {form.depositType === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, depositType: 'fixed' }))}
                        className={`flex-1 py-2 px-3 rounded border-2 font-medium transition ${
                          form.depositType === 'fixed'
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        Fixed ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, depositType: 'percentage' }))}
                        className={`flex-1 py-2 px-3 rounded border-2 font-medium transition ${
                          form.depositType === 'percentage'
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        Percentage (%)
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="depositAmount"
                        value={form.depositAmount}
                        onChange={handleChange}
                        step="0.01"
                        placeholder={form.depositType === 'percentage' ? '0%' : '$0'}
                        className="input-field flex-1"
                      />
                      <span className="flex items-center px-3 bg-gray-50 border border-gray-300 rounded text-gray-600 font-medium">
                        {form.depositType === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end">
            <Link href="/quotes" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <NewQuoteContent />
    </Suspense>
  );
}
