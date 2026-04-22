'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';

interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  description: string;
  customerId: string;
  customerName?: string;
  items: any[];
  subtotal: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  depositType: string;
  depositAmount: number;
  total: number;
  status: string;
  createdAt: string;
}

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadQuote = async () => {
      try {
        const res = await fetch(`/api/quotes/${quoteId}`);
        if (!res.ok) {
          setError('Quote not found');
          return;
        }
        const data = await res.json();
        setQuote(data);
      } catch (err) {
        setError('Failed to load quote');
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [quoteId]);

  const handleDownloadPDF = async () => {
    if (!quote) return;

    setDownloading(true);
    try {
      // Dynamically import dependencies
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const element = document.getElementById('quote-content');
      if (!element) {
        alert('Could not find quote content to download');
        return;
      }

      // Create canvas from HTML element
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10; // Top margin

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= 280 - 20; // Approximate A4 height minus margins

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= 280 - 20;
      }

      pdf.save(`Quote-${quote.quoteNumber}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        alert('Failed to delete quote');
        return;
      }

      router.push('/quotes');
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-red-600 mb-4">{error || 'Quote not found'}</p>
          <Link href="/quotes" className="text-cyan-600 hover:text-cyan-700">
            Back to Quotes
          </Link>
        </div>
      </div>
    );
  }

  const discountAmount = quote.discountAmount || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quote.title}</h1>
            <p className="text-gray-600 mt-1">Quote #{quote.quoteNumber}</p>
          </div>
        </div>

        {/* Printable Content */}
        <div id="quote-content" className="bg-white p-12 mb-6" style={{minHeight: '11in'}}>
          {/* Professional Header with Border */}
          <div className="border-t-4 border-cyan-600 border-l border-r border-b pb-8 mb-8 px-8 pt-8">
            <div className="flex justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Business Manager</h1>
                <p className="text-gray-600">Professional Quote System</p>
              </div>
              <div className="text-right">
                <div className="text-6xl font-light text-gray-300">QUOTE</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Company Info */}
              <div>
                <p className="text-sm font-bold text-cyan-600 mb-3">FROM</p>
                <p className="font-semibold text-gray-900">{quote.title}</p>
                <p className="text-sm text-gray-600">Professional Services</p>
              </div>

              {/* Bill To */}
              <div>
                <p className="text-sm font-bold text-cyan-600 mb-3">BILL TO</p>
                <p className="font-semibold text-gray-900">{quote.customerName || 'Customer'}</p>
                <p className="text-sm text-gray-600">{quote.customer?.email || ''}</p>
                <p className="text-sm text-gray-600">{quote.customer?.phone || ''}</p>
              </div>
            </div>

            {/* Quote Details */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Payment terms</p>
                <p className="font-semibold text-gray-900">Due on receipt</p>
              </div>
              <div>
                <p className="text-gray-600">Quote #</p>
                <p className="font-semibold text-gray-900">{quote.quoteNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">{new Date(quote.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          <div className="mb-8 px-8">
            <h3 className="font-bold text-gray-900 mb-3">Description</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.description}</p>
          </div>

          {/* Items Table */}
          <div className="mb-8 px-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-400 bg-gray-50">
                    <th className="text-left py-3 px-2 font-bold text-gray-900">Description</th>
                    <th className="text-right py-3 px-2 font-bold text-gray-900">Rate</th>
                    <th className="text-right py-3 px-2 font-bold text-gray-900">Qty</th>
                    <th className="text-right py-3 px-2 font-bold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, idx) => {
                    const price = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
                    const qty = typeof item.quantity === 'number' ? item.quantity : 1;
                    return (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3 px-2">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-gray-600 text-xs">{item.description}</p>
                      </td>
                      <td className="text-right py-3 px-2 text-gray-900">${price.toFixed(2)}</td>
                      <td className="text-right py-3 px-2 text-gray-900">{qty}</td>
                      <td className="text-right py-3 px-2 font-semibold text-gray-900">${(price * qty).toFixed(2)}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="px-8 mb-8">
            <div className="flex justify-end max-w-sm ml-auto space-y-2">
              <div className="w-full flex justify-between py-2 text-sm">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-medium text-gray-900">${quote.subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <>
                  <div className="w-full flex justify-between py-2 text-sm">
                    <span className="text-gray-700">Discount ({quote.discountType === 'fixed' ? '$' : quote.discountValue + '%'})</span>
                    <span className="font-medium text-gray-900">-${discountAmount.toFixed(2)}</span>
                  </div>
                </>
              )}

              {quote.taxAmount > 0 && (
                <div className="w-full flex justify-between py-2 text-sm">
                  <span className="text-gray-700">Tax ({quote.taxRate}%)</span>
                  <span className="font-medium text-gray-900">${quote.taxAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="w-full flex justify-between py-3 bg-cyan-600 text-white px-4 rounded font-bold text-lg mt-2">
                <span>Total</span>
                <span>${quote.total.toFixed(2)}</span>
              </div>

              {quote.depositAmount > 0 && (
                <div className="w-full flex justify-between py-2 text-sm mt-2">
                  <span className="text-gray-700">Deposit ({quote.depositType === 'fixed' ? '$' : quote.depositAmount + '%'})</span>
                  <span className="font-medium text-gray-900">${quote.depositAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-300 text-center text-xs text-gray-600">
            <p>Page 1 of 1</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded transition disabled:opacity-50"
          >
            <Download size={18} />
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
          <Link
            href={`/quotes/${quoteId}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Edit Quote
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition"
          >
            <Trash2 size={18} />
            Delete
          </button>
          <Link href="/quotes" className="btn-secondary">
            Back to Quotes
          </Link>
        </div>
      </div>
    </div>
  );
}
