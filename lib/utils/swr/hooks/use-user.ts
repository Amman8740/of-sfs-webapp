import useSWR, { mutate } from 'swr';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/utils/supabase/client';

// Fetcher function for user data
const fetchUser = async (): Promise<User | null> => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw error;
  }
  
  return user;
};

// Fetcher function for user details
const fetchUserDetails = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) {
    throw error;
  }
  
  return data || null;
};

// Hook for current user
export const useUser = () => {
  const { data: user, error, isLoading, mutate: mutateUser } = useSWR(
    'user',
    fetchUser,
    {
      refreshInterval: 0, // Don't auto-refresh user auth
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    user,
    error,
    isLoading,
    mutateUser,
    isAuthenticated: !!user,
  };
};

// Hook for user details
export const useUserDetails = (userId?: string) => {
  const { data: userDetails, error, isLoading, mutate: mutateUserDetails } = useSWR(
    userId ? `user-details-${userId}` : null,
    userId ? () => fetchUserDetails(userId) : null,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    },
  );

  return {
    userDetails,
    error,
    isLoading,
    mutateUserDetails,
  };
};

// Hook for user subscription
export const useSubscription = (userId?: string) => {
  const { data: subscription, error, isLoading, mutate: mutateSubscription } = useSWR(
    userId ? `subscription-${userId}` : null,
    userId ? async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, prices(*, products(*))')
        .in('status', ['trialing', 'active'])
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      return data;
    } : null,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    },
  );

  return {
    subscription,
    error,
    isLoading,
    mutateSubscription,
  };
};

// Utility function to invalidate all user-related data
export const invalidateUserData = async () => {
  await mutate('user');
  await mutate((key) => typeof key === 'string' && key.startsWith('user-details-'));
  await mutate((key) => typeof key === 'string' && key.startsWith('subscription-'));
};
