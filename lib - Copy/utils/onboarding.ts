import { createClient } from '@/lib/utils/supabase/server';

export interface OnboardingStatus {
  isComplete: boolean;
  userType?: 'agency' | 'creator';
  needsOnboarding: boolean;
}

export async function checkOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  try {
    const supabase = await createClient();
    
    // Check if user has completed onboarding
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('onboarding_completed, user_type')
      .eq('id', userId)
      .single() as any;

    if (error || !userProfile) {
      // User profile doesn't exist (PGRST116) or other error, needs onboarding
      if (error?.code === 'PGRST116') {
        console.log('User profile not found for user:', userId);
      }
      return {
        isComplete: false,
        needsOnboarding: true,
      };
    }

    return {
      isComplete: userProfile.onboarding_completed || false,
      userType: userProfile.user_type as 'agency' | 'creator' | undefined,
      needsOnboarding: !userProfile.onboarding_completed,
    };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return {
      isComplete: false,
      needsOnboarding: true,
    };
  }
}

export async function completeOnboarding(
  userId: string, 
  onboardingData: {
    userType: 'agency' | 'creator';
    profileData: any;
    preferences?: any;
  }
) {
  try {
    const supabase = await createClient();
    
    // Get the user's email from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Error getting user email:', authError);
    }

    // Create or update user profile with email
    const profileDataWithEmail = {
      ...onboardingData.profileData,
      email: user?.email // Save email in profile_data
    };

    const { error } = await (supabase as any)
      .from('user_profiles')
      .upsert({
        id: userId,
        user_type: onboardingData.userType,
        onboarding_completed: true,
        profile_data: profileDataWithEmail,
        preferences: onboardingData.preferences || {},
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { success: false, error };
  }
}
