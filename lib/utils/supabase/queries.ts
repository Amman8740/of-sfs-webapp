import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types_db';
import { cache } from 'react';

export const getUser = cache(async (supabase: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: any) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  return subscription;
});

export const getProducts = cache(async (supabase: any) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
});

export const getUserDetails = cache(async (supabase: any) => {
  const { data: userDetails, error } = await supabase
    .from('users')
    .select('*')
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user details:', error);
  }
  
  return userDetails || null;
});
