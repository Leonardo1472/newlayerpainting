'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Home, Calendar, Search, Menu, Plus, LogOut } from 'lucide-react';

export default function Navigation() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-green-600">
            Business Manager
          </Link>

          <div className="hidden md:flex gap-4 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="input-field w-64"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 flex items-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="flex justify-around items-center py-3">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600"
          >
            <Home size={24} />
            <span className="text-xs">Home</span>
          </Link>

          <Link
            href="/schedule"
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600"
          >
            <Calendar size={24} />
            <span className="text-xs">Schedule</span>
          </Link>

          <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600 relative">
            <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center absolute -top-6">
              <Plus size={24} />
            </div>
          </button>

          <Link
            href="/search"
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600"
          >
            <Search size={24} />
            <span className="text-xs">Search</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-600"
          >
            <LogOut size={24} />
            <span className="text-xs">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden">
          <div className="bg-white w-64 h-full p-4">
            <nav className="space-y-4">
              <Link href="/customers" className="block text-gray-600 hover:text-green-600">
                Customers
              </Link>
              <Link href="/products" className="block text-gray-600 hover:text-green-600">
                Products
              </Link>
              <Link href="/quotes" className="block text-gray-600 hover:text-green-600">
                Quotes
              </Link>
              <Link href="/jobs" className="block text-gray-600 hover:text-green-600">
                Jobs
              </Link>
              <Link href="/invoices" className="block text-gray-600 hover:text-green-600">
                Invoices
              </Link>
              <Link href="/tasks" className="block text-gray-600 hover:text-green-600">
                Tasks
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
