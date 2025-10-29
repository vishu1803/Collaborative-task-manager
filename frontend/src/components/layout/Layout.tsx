'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/Button';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { clsx } from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
  try {
    await logout(); // ensure async logout finishes
    localStorage.removeItem('auth_token'); // double ensure removal
    router.push('/auth/login'); // redirect after token cleared
  } catch (error) {
    console.error('Logout failed:', error);
  }
};


  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'All Tasks', href: '/tasks', icon: '📋' },
    { name: 'My Tasks', href: '/my-tasks', icon: '👤' },
    { name: 'Profile', href: '/profile', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                  TaskManager
                  {/* Real-time indicator */}
                  {isConnected && (
                    <span className="ml-2 text-xs text-green-600">●</span>
                  )}
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                      pathname === item.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              {/* Connection Status */}
              <ConnectionStatus />

              {/* Notifications */}
              <NotificationDropdown />

              {/* User Info */}
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.name}</span>
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center space-x-2">
              <NotificationDropdown />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                    pathname === item.href
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
              </div>
              <div className="mt-3 space-y-1 px-4">
                <ConnectionStatus />
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    className="w-full text-left"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
