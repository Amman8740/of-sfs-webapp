import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user profile exists and get onboarding status
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('onboarding_completed, user_type')
      .eq('id', user.id)
      .maybeSingle();

    // Debug logging
    console.log('Onboarding status check for user:', user.id, {
      hasProfile: !!userProfile,
      onboardingCompleted: userProfile?.onboarding_completed,
      userType: userProfile?.user_type
    });

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    // If no profile exists, user needs onboarding (don't create here)
    if (!userProfile) {
      console.log('No user profile found for user:', user.id);
      return NextResponse.json({ 
        needsOnboarding: true,
        isComplete: false,
        userType: null
      });
    }

    const needsOnboarding = !userProfile.onboarding_completed;

    return NextResponse.json({ 
      needsOnboarding,
      isComplete: userProfile.onboarding_completed || false,
      userType: userProfile.user_type
    });
  } catch (error) {
    console.error('Error in onboarding-status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
