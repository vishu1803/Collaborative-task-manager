import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { SWR_KEYS, getAuthSWRKey } from '@/lib/swr';
import { authAPI } from '@/lib/api';

// Hook to fetch current user profile
export function useUserProfile() {
  const key = getAuthSWRKey(SWR_KEYS.USER_PROFILE);
  
  const { data, error, isLoading, mutate } = useSWR(key);

  return {
    user: data || null,
    loading: isLoading,
    error: error?.message || null,
    mutate,
    refresh: () => mutate(),
  };
}

// Mutation hook for updating profile
export function useUpdateProfile() {
  return useSWRMutation(
    SWR_KEYS.USER_PROFILE,
    async (_key, { arg }: { arg: { name?: string; email?: string } }) => {
      const response = await authAPI.updateProfile(arg);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    }
  );
}
