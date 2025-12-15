import useSWR, { mutate } from 'swr';
import { createClient } from '@/lib/utils/supabase/client';

// Generic fetcher for Supabase queries
const createSupabaseFetcher = <T>(queryFn: () => Promise<T>) => {
  return async (): Promise<T> => {
    try {
      return await queryFn();
    } catch (error) {
      console.error('SWR fetcher error:', error);
      throw error;
    }
  };
};

// Hook for user data (using existing 'users' table)
export const useUserData = (userId?: string) => {
  const { data: userData, error, isLoading, mutate: mutateUserData } = useSWR(
    userId ? `user-data-${userId}` : null,
    userId ? createSupabaseFetcher(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data || null;
    }) : null,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    },
  );

  return {
    userData,
    error,
    isLoading,
    mutateUserData,
  };
};

// Hook for subscription data (using existing 'subscriptions' table)
export const useSubscriptionData = (userId?: string) => {
  const { data: subscriptionData, error, isLoading, mutate: mutateSubscriptionData } = useSWR(
    userId ? `subscription-data-${userId}` : null,
    userId ? createSupabaseFetcher(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, prices(*, products(*))')
        .eq('user_id', userId)
        .in('status', ['trialing', 'active'])
        .maybeSingle();
      
      if (error) throw error;
      return data || null;
    }) : null,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    },
  );

  return {
    subscriptionData,
    error,
    isLoading,
    mutateSubscriptionData,
  };
};

// Hook for products data (using existing 'products' table)
export const useProductsData = () => {
  const { data: productsData, error, isLoading, mutate: mutateProductsData } = useSWR(
    'products-data',
    createSupabaseFetcher(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, prices(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true,
    },
  );

  return {
    productsData,
    error,
    isLoading,
    mutateProductsData,
  };
};

// Hook for customer data (using existing 'customers' table)
export const useCustomerData = (userId?: string) => {
  const { data: customerData, error, isLoading, mutate: mutateCustomerData } = useSWR(
    userId ? `customer-data-${userId}` : null,
    userId ? createSupabaseFetcher(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data || null;
    }) : null,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    },
  );

  return {
    customerData,
    error,
    isLoading,
    mutateCustomerData,
  };
};

// Hook for prices data (using existing 'prices' table)
export const usePricesData = () => {
  const { data: pricesData, error, isLoading, mutate: mutatePricesData } = useSWR(
    'prices-data',
    createSupabaseFetcher(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('prices')
        .select('*, products(*)')
        .order('unit_amount', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true,
    },
  );

  return {
    pricesData,
    error,
    isLoading,
    mutatePricesData,
  };
};

// Utility function to invalidate all content data
export const invalidateContentData = async (userId?: string) => {
  if (userId) {
    await Promise.all([
      mutate(`user-data-${userId}`),
      mutate(`subscription-data-${userId}`),
      mutate(`customer-data-${userId}`),
    ]);
  }
  
  await Promise.all([
    mutate('products-data'),
    mutate('prices-data'),
  ]);
};
