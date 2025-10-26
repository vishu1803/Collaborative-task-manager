'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Redirect authenticated users to dashboard
        router.replace('/dashboard');
      } else {
        // Redirect unauthenticated users to login
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, loading, user, router]);

  // Show loading spinner while determining authentication status
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
