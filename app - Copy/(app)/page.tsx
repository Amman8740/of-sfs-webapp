export const dynamic = 'force-dynamic';
import { getUser } from '@/lib/utils/supabase/queries';
import { createClient } from '@/lib/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect('/signin');
  }

  // Check if user has completed onboarding (server-side version)
  try {
    const { data: userProfile, error } = await (supabase as any)
      .from('user_profiles')
      .select('onboarding_completed, user_type')
      .eq('id', user.id)
      .maybeSingle();

    // If no profile exists or profile incomplete, redirect to onboarding
    if (error || !userProfile || !userProfile.onboarding_completed) {
      if (error?.code === 'PGRST116') {
        console.log('User profile not found, redirecting to onboarding...');
      } else if (userProfile && !userProfile.onboarding_completed) {
        console.log('User onboarding not completed, redirecting to onboarding...');
      } else {
        console.log('No user profile or error, redirecting to onboarding...');
      }
      redirect('/onboarding');
    }

    // User has completed onboarding, redirect to appropriate dashboard
    console.log('User profile data:', userProfile);
    console.log('User type:', userProfile.user_type, 'Type of user_type:', typeof userProfile.user_type);
    
    // Handle null/undefined user_type by redirecting to onboarding
    if (!userProfile.user_type) {
      console.log('User type is null/undefined, redirecting to onboarding...');
      redirect('/onboarding');
    }
    
    const redirectPath = userProfile.user_type === 'agency' ? '/agency' : '/creator';
    console.log('Redirecting user to:', redirectPath, 'User type:', userProfile.user_type);
    redirect(redirectPath);
  } catch (error) {
    // If there's an error checking onboarding status, redirect to onboarding
    console.error('Error checking onboarding status:', error);
    redirect('/onboarding');
  }

  return <div></div>;

}
