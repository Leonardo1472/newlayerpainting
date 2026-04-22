'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Request {
  id: string;
  title: string;
  description?: string;
  status: string;
  requestDate: string;
  requestTime: string;
  customer: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const res = await fetch(`/api/requests/${requestId}`);
        if (!res.ok) {
          setError('Request not found');
          return;
        }
        const data = await res.json();
        setRequest(data);
      } catch (err) {
        setError('Failed to load request');
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [requestId]);

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this request? This action cannot be undone.');

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        setError('Failed to delete request');
        setDeleting(false);
        return;
      }

      // Redirect to requests list
      router.push('/requests');
    } catch (err) {
      setError('An error occurred while deleting');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-red-600">{error || 'Request not found'}</p>
          <Link href="/requests" className="text-green-600 hover:text-green-700 mt-4 inline-block">
            Back to Requests
          </Link>
        </div>
      </div>
    );
  }

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

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
            <p className="text-gray-600">From {request.customer.name}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-gray-900 font-medium mt-2">{new Date(request.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Visit Date</p>
                <p className="text-gray-900 font-medium mt-1">{new Date(request.requestDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Visit Time</p>
                <p className="text-gray-900 font-medium mt-1">{request.requestTime}</p>
              </div>
            </div>
          </div>

          {request.description && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
            </div>
          )}

          <div className="border-t pt-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Info</h2>
            <p className="text-gray-900 font-medium">{request.customer.name}</p>
            <Link
              href={`/customers/${request.customer.id}`}
              className="text-green-600 hover:text-green-700 mt-3 inline-block"
            >
              View Customer Profile →
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href={`/quotes/new?customerId=${request.customer.id}`}
            className="btn-primary"
          >
            Create Quote from This Request
          </Link>
          <Link href="/requests" className="btn-secondary">
            Back to Requests
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger"
          >
            {deleting ? 'Deleting...' : 'Delete Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
