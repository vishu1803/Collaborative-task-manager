import useSWR from 'swr';
import { SWR_KEYS, getAuthSWRKey } from '@/lib/swr';

// Hook to fetch all users
export function useUsers(includeMe: boolean = false) {
  const key = getAuthSWRKey(SWR_KEYS.USERS(includeMe));
  
  const { data, error, isLoading, mutate } = useSWR(key);

  return {
    users: data?.users || [],
    total: data?.total || 0,
    loading: isLoading,
    error: error?.message || null,
    mutate,
    refresh: () => mutate(),
  };
}

// Hook to search users
export function useUserSearch(query: string, includeMe: boolean = false) {
  const key = getAuthSWRKey(
    query && query.length >= 2 ? SWR_KEYS.USER_SEARCH(query, includeMe) : null
  );
  
  const { data, error, isLoading, mutate } = useSWR(key);

  return {
    users: data?.users || [],
    total: data?.total || 0,
    searchTerm: data?.searchTerm || query,
    loading: isLoading,
    error: error?.message || null,
    mutate,
    refresh: () => mutate(),
  };
}

// Hook to fetch user by ID
export function useUser(id: string) {
  const key = getAuthSWRKey(id ? SWR_KEYS.USER_BY_ID(id) : null);
  
  const { data, error, isLoading, mutate } = useSWR(key);

  return {
    user: data || null,
    loading: isLoading,
    error: error?.message || null,
    mutate,
    refresh: () => mutate(),
  };
}

// Hook to fetch current user's statistics
export function useMyStats() {
  const key = getAuthSWRKey(SWR_KEYS.MY_STATS);
  
  const { data, error, isLoading, mutate } = useSWR(key);

  return {
    stats: data || null,
    loading: isLoading,
    error: error?.message || null,
    mutate,
    refresh: () => mutate(),
  };
}

// Hook to fetch user statistics by ID
export function useUserStats(id: string) {
  const key = getAuthSWRKey(id ? SWR_KEYS.USER_STATS(id) : null);
  
  const { data, error, isLoading, mutate } = useSWR(key);

  return {
    stats: data || null,
    loading: isLoading,
    error: error?.message || null,
    mutate,
    refresh: () => mutate(),
  };
}
