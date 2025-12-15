import React from 'react';
import { redirect } from 'next/navigation';
import { NavLinks } from './nav-links';
import { createClient } from '@/lib/utils/supabase/server';
import { Tables } from '@/types_db';

type User = Tables<'users'>;
type UserProfile = Tables<'user_profiles'>;

export default async function Navbar() {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return (
      <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Please sign in</div>
      </div>
    );
  }

  // Get basic user data from users table
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle() as { data: User | null, error: any };

  // Get extended profile data from user_profiles table
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle() as { data: UserProfile | null, error: any };

  // If both userData and userProfile are null and there are no PGRST116 errors,
  // it means the user was deleted from the database but still has an active session
  if (!userData && !userProfile && 
      userDataError?.code !== 'PGRST116' && 
      profileError?.code !== 'PGRST116') {
    console.log('User not found in database, clearing session and redirecting to signin...');
    // Clear the session before redirecting
    await supabase.auth.signOut();
    redirect('/signin');
  }

  // Combine the data for display
  const profileData = userProfile?.profile_data as any;
  const displayUser: User = {
    id: user.id,
    email: userData?.email || user.email || null,
    full_name: profileData?.firstName && profileData?.lastName 
      ? `${profileData.firstName} ${profileData.lastName}`
      : profileData?.firstName 
      ? profileData.firstName
      : userData?.full_name || null,
    avatar_url: userData?.avatar_url || null,
    billing_address: userData?.billing_address || null,
    payment_method: userData?.payment_method || null
  };

  console.log("🚀 ~ Navbar ~ displayUser:", displayUser);

  return (
    <>
      <NavLinks user={displayUser} />
    </>
  );
}
