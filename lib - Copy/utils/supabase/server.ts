/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database, Tables } from '@/types_db';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }

        },
      },
    },
  );
}

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
  }
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
  }
  
  return createSupabaseClient<Database>(url, serviceRoleKey);
}

export async function createUserWithAdminAPI(
  email: string,
  password: string,
  metadata?: Record<string, any>
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration');
  }

  try {
    const response = await fetch(`${url}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata || {},
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Supabase API error:', data);
      throw new Error(data.message || 'Failed to create user');
    }

    return { data: { user: data }, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { data: null, error };
  }
}

export async function getSession() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

type User = Tables<'users'>
export async function getUserDetails(): Promise<User | null> {
  const supabase = await createClient(); 
  try {
    const { data: userDetails, error } = await supabase
      .from('users')
      .select('*')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user details:', error);
    }

    return userDetails;
  } catch (error) {
    console.error('Error in getUserDetails:', error);
    return null;
  }
}

export async function getSubscription(userId: string) {
  const supabase = await createClient();
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .eq('user_id', userId)
      .maybeSingle();

    return subscription;
  } catch {
    return null;
  }
}

export const getActiveProductsWithPrices = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      prices(*)
    `)
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index');

  if (error) {
    console.log(error.message);
  }
  // Workaround for the price being null
  return data?.map((product: any) => ({
    ...product,
    prices: product.prices?.filter((price: any) => price.active) ?? [],
  })) ?? [];
};

type Model = Tables<'models'>
type Model = Tables<'models'>;

export async function getModels(
  excludeUserId?: string,
  agencyId?: string
): Promise<any[]> {
  const supabase = createServiceRoleClient();

  try {
    // Base query
    let query = supabase
      .from('models')
      .select('*')
      .order('created_at', { ascending: false });

    // 🧠 Agency filter — only their own models
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }

    // 🚫 Creator exclusion (hide their own model)
    if (excludeUserId) {
      query = query.neq('user_id', excludeUserId);
    }

    // Fetch models
    const { data: models, error: modelError } = await query;
    if (modelError) {
      console.error('Error fetching models:', modelError);
      return [];
    }

    // Fetch OnlyFans profile data for merging
    const { data: onlyfansProfiles, error: ofError } = await supabase
      .from('onlyfans_profiles')
      .select('user_id, fans, subscription_type, is_verified');

    if (ofError) {
      console.error('Error fetching onlyfans profiles:', ofError);
    }

    // Merge
    const merged = models.map((m) => {
      const of = onlyfansProfiles?.find((p) => p.user_id === m.user_id);
      return {
        ...m,
        fan_count: of?.fans ?? m.fan_count ?? 0,
        subscription_type:
          of?.subscription_type ?? m.subscription_type ?? 'Unknown',
        is_verified: of?.is_verified ?? m.is_verified ?? false,
      };
    });

    return merged;
  } catch (error) {
    console.error('Error in getModels:', error);
    return [];
  }
}


export async function getModelById(modelId: string): Promise<any | null> {
  const supabase = createServiceRoleClient();

  try {
    // 1️⃣ Get the model
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('*')
      .eq('id', modelId)
      .maybeSingle();

    if (modelError) {
      console.error('Error fetching model:', modelError);
      return null;
    }

    if (!model) {
      console.warn('No model found for ID:', modelId);
      return null;
    }

    // 2️⃣ Fetch related onlyfans_profile manually (using user_id)
    const { data: onlyfansProfile, error: ofError } = await supabase
      .from('onlyfans_profiles')
      .select('*')
      .eq('user_id', model.user_id)
      .maybeSingle();

    if (ofError) {
      console.error('Error fetching onlyfans profile:', ofError);
    }

    // 3️⃣ Merge and return
    return {
      ...model,
      onlyfans_profile: onlyfansProfile || null,
    };
  } catch (error) {
    console.error('Error in getModelById:', error);
    return null;
  }
}

export async function getModelByUserId(userId: string): Promise<any | null> {
  const supabase = createServiceRoleClient();

  try {
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (modelError) {
      console.error('Error fetching model by user_id:', modelError);
      return null;
    }

    if (!model) {
      console.warn('No model found for user_id:', userId);
      return null;
    }

    const { data: onlyfansProfile, error: ofError } = await supabase
      .from('onlyfans_profiles')
      .select('*')
      .eq('user_id', model.user_id)
      .maybeSingle();

    if (ofError) {
      console.error('Error fetching onlyfans profile:', ofError);
    }

    return {
      ...model,
      onlyfans_profile: onlyfansProfile || null,
    };
  } catch (error) {
    console.error('Error in getModelByUserId:', error);
    return null;
  }
}

