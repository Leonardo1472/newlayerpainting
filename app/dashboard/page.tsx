'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

interface Metrics {
  allRequests: number;
  quotesPending: number;
  quotesSent: number;
  tasksToday: number;
}

interface ScheduleItem {
  id: string;
  title: string;
  type: 'event' | 'request' | 'job' | 'task';
  date: string;
  time?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    allRequests: 0,
    quotesPending: 0,
    quotesSent: 0,
    tasksToday: 0,
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/auth/login');
      return;
    }
    setUser(JSON.parse(userStr));

    // Load metrics
    const loadMetrics = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Get all requests
        const requestsRes = await fetch('/api/requests');
        const requests = requestsRes.ok ? await requestsRes.json() : [];
        const allRequests = requests.length;

        // Get quotes
        const quotesRes = await fetch('/api/quotes');
        const quotes = quotesRes.ok ? await quotesRes.json() : [];
        const quotesPending = quotes.filter((q: any) => q.status === 'draft').length;
        const quotesSent = quotes.filter((q: any) => q.status === 'sent').length;

        // Get today's tasks
        const tasksRes = await fetch('/api/tasks');
        const tasks = tasksRes.ok ? await tasksRes.json() : [];
        const tasksToday = tasks.filter((t: any) =>
          t.dueDate && t.dueDate.split('T')[0] === today && t.status !== 'completed'
        ).length;

        setMetrics({
          allRequests,
          quotesPending,
          quotesSent,
          tasksToday,
        });

        // Load upcoming schedule
        const scheduleItems: ScheduleItem[] = [];

        // Get upcoming requests
        requests.forEach((r: any) => {
          const reqDate = new Date(r.requestDate);
          if (reqDate >= new Date()) {
            scheduleItems.push({
              id: r.id,
              title: r.title,
              type: 'request',
              date: r.requestDate,
              time: r.requestTime,
            });
          }
        });

        // Get upcoming jobs with due dates
        const jobsRes = await fetch('/api/jobs');
        if (jobsRes.ok) {
          const jobs = await jobsRes.json();
          jobs.forEach((j: any) => {
            if (j.dueDate && new Date(j.dueDate) >= new Date()) {
              scheduleItems.push({
                id: j.id,
                title: j.title,
                type: 'job',
                date: j.dueDate,
              });
            }
          });
        }

        // Get upcoming tasks
        tasks.forEach((t: any) => {
          if (t.dueDate && new Date(t.dueDate) >= new Date() && t.status !== 'completed') {
            scheduleItems.push({
              id: t.id,
              title: t.title,
              type: 'task',
              date: t.dueDate,
              time: t.dueTime,
            });
          }
        });

        // Sort by date
        scheduleItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setSchedule(scheduleItems.slice(0, 7)); // Show next 7 upcoming items
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Company Branding */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <Image
              src="/logo.png"
              alt="New Layer Painting Logo"
              width={90}
              height={72}
              priority
              className="object-contain flex-shrink-0"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">New Layer Painting</h1>
            </div>
          </div>
        </div>

        {/* Metrics Cards - Workflow Pipeline */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Business Pipeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/requests"
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200 hover:shadow-lg hover:border-blue-400 hover:scale-110 active:scale-95 transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-700 font-medium text-sm">Requests</p>
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-4xl font-bold text-blue-600">{metrics.allRequests}</p>
              <p className="text-xs text-gray-600 mt-2">Total requests</p>
            </Link>

            <Link
              href="/quotes"
              className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border-2 border-red-200 hover:shadow-lg hover:border-red-400 hover:scale-110 active:scale-95 transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-700 font-medium text-sm">Pending Quotes</p>
                <span className="text-2xl">⏳</span>
              </div>
              <p className="text-4xl font-bold text-red-600">{metrics.quotesPending}</p>
              <p className="text-xs text-gray-600 mt-2">Awaiting approval</p>
            </Link>

            <Link
              href="/quotes"
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border-2 border-emerald-200 hover:shadow-lg hover:border-emerald-400 hover:scale-110 active:scale-95 transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-700 font-medium text-sm">Approved</p>
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-4xl font-bold text-emerald-600">{metrics.quotesSent}</p>
              <p className="text-xs text-gray-600 mt-2">Ready to convert</p>
            </Link>

            <Link
              href="/tasks"
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200 hover:shadow-lg hover:border-blue-400 hover:scale-110 active:scale-95 transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-700 font-medium text-sm">Tasks Today</p>
                <span className="text-2xl">☑️</span>
              </div>
              <p className="text-4xl font-bold text-blue-600">{metrics.tasksToday}</p>
              <p className="text-xs text-gray-600 mt-2">Due today</p>
            </Link>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-cyan-500">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📅 What's Coming Up</h2>
          {schedule.length === 0 ? (
            <p className="text-gray-600 text-sm">No upcoming items. Create a request or task to see them here!</p>
          ) : (
            <div className="space-y-3">
              {schedule.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => router.push(`/${item.type}s/${item.id}`)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 hover:border-green-500 transition text-left cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString()} {item.time && `at ${item.time}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    item.type === 'request' ? 'bg-green-100 text-green-800' :
                    item.type === 'job' ? 'bg-purple-100 text-purple-800' :
                    item.type === 'task' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Browse */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-cyan-500">
            <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/requests/new" className="btn-primary w-full text-center block">
                + New Request
              </Link>
              <Link href="/quotes/new" className="btn-primary w-full text-center block">
                + New Quote
              </Link>
              <Link href="/invoices/new" className="btn-primary w-full text-center block">
                + New Invoice
              </Link>
              <Link href="/customers/new" className="btn-secondary w-full text-center block">
                + New Customer
              </Link>
              <Link href="/tasks/new" className="btn-secondary w-full text-center block">
                + New Task
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📂 Browse</h2>
            <div className="space-y-2">
              <Link href="/customers" className="block text-cyan-600 hover:text-cyan-700">
                → Customers
              </Link>
              <Link href="/requests" className="block text-cyan-600 hover:text-cyan-700">
                → Requests
              </Link>
              <Link href="/quotes" className="block text-cyan-600 hover:text-cyan-700">
                → Quotes
              </Link>
              <Link href="/jobs" className="block text-cyan-600 hover:text-cyan-700">
                → Jobs
              </Link>
              <Link href="/invoices" className="block text-cyan-600 hover:text-cyan-700">
                → Invoices
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
