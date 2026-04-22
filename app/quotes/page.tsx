'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  customer: {
    name: string;
  };
  status: string;
  total: number;
  createdAt: string;
}

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const res = await fetch('/api/quotes');
        if (res.ok) {
          const data = await res.json();
          setQuotes(data);
          setFilteredQuotes(data);
        }
      } catch (err) {
        console.error('Failed to load quotes');
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, []);

  useEffect(() => {
    const filtered = quotes.filter(quote =>
      quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuotes(filtered);
  }, [searchTerm, quotes]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (quoteId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this quote? This action cannot be undone.');

    if (!confirmed) {
      return;
    }

    setDeleting(quoteId);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setQuotes(quotes.filter(q => q.id !== quoteId));
      }
    } catch (err) {
      console.error('Failed to delete quote');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <Link
            href="/quotes/new"
            className="flex items-center gap-2 btn-primary"
          >
            <Plus size={20} />
            New Quote
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredQuotes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No quotes found. {searchTerm && 'Try adjusting your search.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Quote #
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredQuotes.map((quote) => (
                    <tr
                      key={quote.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td
                        className="px-6 py-4 text-sm font-medium text-gray-900 cursor-pointer"
                        onClick={() => router.push(`/quotes/${quote.id}`)}
                      >
                        {quote.quoteNumber}
                      </td>
                      <td
                        className="px-6 py-4 text-sm font-medium text-gray-900 cursor-pointer"
                        onClick={() => router.push(`/quotes/${quote.id}`)}
                      >
                        {quote.title}
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-gray-600 cursor-pointer"
                        onClick={() => router.push(`/quotes/${quote.id}`)}
                      >
                        {quote.customer.name}
                      </td>
                      <td
                        className="px-6 py-4 text-sm font-medium text-gray-900 cursor-pointer"
                        onClick={() => router.push(`/quotes/${quote.id}`)}
                      >
                        ${quote.total.toFixed(2)}
                      </td>
                      <td
                        className="px-6 py-4 text-sm cursor-pointer"
                        onClick={() => router.push(`/quotes/${quote.id}`)}
                      >
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/quotes/${quote.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(quote.id);
                          }}
                          disabled={deleting === quote.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
