'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI, userAPI } from '@/lib/api';

const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  // Fetch user stats
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userAPI.getMyStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile(data);
      
      if (response.success && response.data) {
        updateUser(response.data);
        setSuccess('Profile updated successfully');
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information and view your statistics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register('name')}
                  label="Full Name"
                  placeholder="Enter your full name"
                  error={errors.name?.message || ''} 
                />

                <Input
                  {...register('email')}
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  error={errors.email?.message || ''}
                />

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                {success && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-700">{success}</div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!isDirty}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>

              {/* Account Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Member since:</span>
                    <span className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last updated:</span>
                    <span className="text-gray-900">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Statistics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Statistics</h2>
              
              {statsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : stats ? (
                <div className="space-y-6">
                  {/* Task Overview */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Task Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-semibold text-blue-600">
                          {stats.statistics?.totalCreated || 0}
                        </div>
                        <div className="text-xs text-gray-500">Created</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-semibold text-green-600">
                          {stats.statistics?.totalAssigned || 0}
                        </div>
                        <div className="text-xs text-gray-500">Assigned</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-semibold text-purple-600">
                          {stats.statistics?.completedTasks || 0}
                        </div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-xl font-semibold text-red-600">
                          {stats.statistics?.overdueTasks || 0}
                        </div>
                        <div className="text-xs text-gray-500">Overdue</div>
                      </div>
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Completion Rate</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {stats.statistics?.completionRate || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.statistics?.completionRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Performance</h3>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">
                        {stats.statistics?.completionRate >= 80 ? '🏆' : 
                         stats.statistics?.completionRate >= 60 ? '🎯' : 
                         stats.statistics?.completionRate >= 40 ? '📈' : '💪'}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {stats.statistics?.completionRate >= 80 ? 'Excellent Performance!' : 
                         stats.statistics?.completionRate >= 60 ? 'Great Work!' : 
                         stats.statistics?.completionRate >= 40 ? 'Making Progress!' : 'Keep Going!'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No statistics available
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
