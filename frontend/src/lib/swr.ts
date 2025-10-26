import { SWRConfiguration, mutate } from 'swr';
import { api } from './api';

// Default SWR configuration
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0, // Disable automatic polling by default
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: (error) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }
    return true;
  },
  onError: (error) => {
    console.error('SWR Error:', error);
  },
  fetcher: async (url: string) => {
    const response = await api.get(url);
    if (!response.success) {
      const error = new Error(response.message);
      (error as any).status = response.error ? 400 : 500;
      throw error;
    }
    return response.data;
  },
};

// Helper function to get SWR key with auth check
export const getAuthSWRKey = (key: string | null) => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('auth_token');
  return token ? key : null;
};

// Cache keys for consistent cache management
export const SWR_KEYS = {
  // Auth keys
  USER_PROFILE: '/auth/profile',
  
  // Task keys
  TASKS: (params?: Record<string, any>) => {
    if (!params) return '/tasks';
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    return `/tasks?${searchParams.toString()}`;
  },
  TASK_BY_ID: (id: string) => `/tasks/${id}`,
  MY_TASKS: (type?: string) => type ? `/tasks/my-tasks?type=${type}` : '/tasks/my-tasks',
  OVERDUE_TASKS: '/tasks/overdue',
  TASK_STATISTICS: (userId?: string) => userId ? `/tasks/statistics?userId=${userId}` : '/tasks/statistics',
  
  // User keys
  USERS: (includeMe?: boolean) => includeMe ? '/users?includeMe=true' : '/users',
  USER_SEARCH: (query: string, includeMe?: boolean) => {
    const params = new URLSearchParams({ q: query });
    if (includeMe) params.append('includeMe', 'true');
    return `/users/search?${params.toString()}`;
  },
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_STATS: (id: string) => `/users/${id}/stats`,
  MY_STATS: '/users/me/stats',
};

// Global mutate function for cache invalidation
export const invalidateCache = (key: string | string[]) => {
  if (Array.isArray(key)) {
    return Promise.all(key.map(k => mutate(k)));
  }
  return mutate(key);
};

// Helper to invalidate all task-related cache
export const invalidateTaskCache = () => {
  return Promise.all([
    mutate(key => typeof key === 'string' && key.startsWith('/tasks')),
    mutate(SWR_KEYS.TASK_STATISTICS()),
    mutate(SWR_KEYS.MY_STATS),
  ]);
};
