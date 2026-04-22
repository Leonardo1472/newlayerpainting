'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

interface Request {
  id: string;
  title: string;
  customer: {
    name: string;
  };
  status: string;
  requestDate: string;
  requestTime: string;
  createdAt: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await fetch('/api/requests');
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
          setFilteredRequests(data);
        }
      } catch (err) {
        console.error('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  useEffect(() => {
    const filtered = requests.filter(request =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  const handleDelete = async (requestId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this request? This action cannot be undone.');

    if (!confirmed) {
      return;
    }

    setDeleting(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Remove from list
        setRequests(requests.filter(r => r.id !== requestId));
      }
    } catch (err) {
      console.error('Failed to delete request');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
          <Link
            href="/requests/new"
            className="flex items-center gap-2 btn-primary"
          >
            <Plus size={20} />
            New Request
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search requests..."
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
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No requests found. {searchTerm && 'Try adjusting your search.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date & Time
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
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td
                        className="px-6 py-4 text-sm font-medium text-gray-900 cursor-pointer"
                        onClick={() => router.push(`/requests/${request.id}`)}
                      >
                        {request.title}
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-gray-600 cursor-pointer"
                        onClick={() => router.push(`/requests/${request.id}`)}
                      >
                        {request.customer.name}
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-gray-600 cursor-pointer"
                        onClick={() => router.push(`/requests/${request.id}`)}
                      >
                        {new Date(request.requestDate).toLocaleDateString()} at{' '}
                        {request.requestTime}
                      </td>
                      <td
                        className="px-6 py-4 text-sm cursor-pointer"
                        onClick={() => router.push(`/requests/${request.id}`)}
                      >
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/requests/${request.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(request.id);
                          }}
                          disabled={deleting === request.id}
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
