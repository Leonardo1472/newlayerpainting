'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { FileText, Zap, Receipt, Briefcase, ArrowLeft } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface Activity {
  type: 'request' | 'quote' | 'job' | 'invoice';
  title: string;
  status: string;
  createdAt: string;
  id: string;
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${customerId}`);
        if (!res.ok) {
          setError('Customer not found');
          return;
        }
        const data = await res.json();
        setCustomer(data);

        // Load related activity
        const activities: Activity[] = [];

        const requestsRes = await fetch(`/api/requests`);
        if (requestsRes.ok) {
          const requests = await requestsRes.json();
          const customerRequests = requests.filter((r: any) => r.customerId === customerId);
          activities.push(...customerRequests.map((r: any) => ({
            type: 'request' as const,
            title: r.title,
            status: r.status,
            createdAt: r.createdAt,
            id: r.id,
          })));
        }

        const quotesRes = await fetch(`/api/quotes`);
        if (quotesRes.ok) {
          const quotes = await quotesRes.json();
          const customerQuotes = quotes.filter((q: any) => q.customerId === customerId);
          activities.push(...customerQuotes.map((q: any) => ({
            type: 'quote' as const,
            title: q.title,
            status: q.status,
            createdAt: q.createdAt,
            id: q.id,
          })));
        }

        const jobsRes = await fetch(`/api/jobs`);
        if (jobsRes.ok) {
          const jobs = await jobsRes.json();
          const customerJobs = jobs.filter((j: any) => j.customerId === customerId);
          activities.push(...customerJobs.map((j: any) => ({
            type: 'job' as const,
            title: j.title,
            status: j.status,
            createdAt: j.createdAt,
            id: j.id,
          })));
        }

        const invoicesRes = await fetch(`/api/invoices`);
        if (invoicesRes.ok) {
          const invoices = await invoicesRes.json();
          const customerInvoices = invoices.filter((i: any) => i.customerId === customerId);
          activities.push(...customerInvoices.map((i: any) => ({
            type: 'invoice' as const,
            title: `Invoice ${i.invoiceNumber}`,
            status: i.status,
            createdAt: i.createdAt,
            id: i.id,
          })));
        }

        // Sort by date, most recent first
        activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActivity(activities.slice(0, 10)); // Show last 10
      } catch (err) {
        setError('Failed to load customer');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [customerId]);

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

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-red-600">{error || 'Customer not found'}</p>
          <Link href="/customers" className="text-green-600 hover:text-green-700 mt-4 inline-block">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600">{customer.email || 'No email'}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-900 font-medium">{customer.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900 font-medium">{customer.email || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-gray-900 font-medium">
                {customer.address && `${customer.address}, ${customer.city}, ${customer.state} ${customer.postalCode}`}
                {!customer.address && '-'}
              </p>
            </div>
          </div>
        </div>

        {/* What's Next? */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">What would you like to do?</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Link
              href={`/requests/new?customerId=${customerId}`}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded hover:border-green-500 hover:bg-green-50 transition text-center"
            >
              <Zap size={32} className="text-green-600 mb-2" />
              <span className="font-medium text-sm">New Request</span>
            </Link>

            <Link
              href={`/quotes/new?customerId=${customerId}`}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <FileText size={32} className="text-blue-600 mb-2" />
              <span className="font-medium text-sm">New Quote</span>
            </Link>

            <Link
              href={`/invoices/new?customerId=${customerId}`}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded hover:border-orange-500 hover:bg-orange-50 transition text-center"
            >
              <Receipt size={32} className="text-orange-600 mb-2" />
              <span className="font-medium text-sm">New Invoice</span>
            </Link>

            <Link
              href={`/jobs/new?customerId=${customerId}`}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded hover:border-purple-500 hover:bg-purple-50 transition text-center"
            >
              <Briefcase size={32} className="text-purple-600 mb-2" />
              <span className="font-medium text-sm">New Job</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        {activity.length > 0 && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
