import { createClient } from '@/lib/utils/supabase/client';

export interface OnboardingStatus {
  isComplete: boolean;
  userType?: 'agency' | 'creator';
  needsOnboarding: boolean;
}

export async function checkOnboardingStatusClient(userId: string): Promise<OnboardingStatus> {
  try {
    // Check if user has completed onboarding via dedicated API
    const response = await fetch('/api/onboarding-status');
    
    if (!response.ok) {
      // Error occurred, assume needs onboarding
      return {
        isComplete: false,
        needsOnboarding: true,
      };
    }

    const { needsOnboarding, isComplete, userType } = await response.json();

    return {
      isComplete: isComplete || false,
      userType: userType as 'agency' | 'creator' | undefined,
      needsOnboarding: needsOnboarding || false,
    };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return {
      isComplete: false,
      needsOnboarding: true,
    };
  }
}

export async function completeOnboardingClient(
  userId: string, 
  onboardingData: {
    userType: 'agency' | 'creator';
    profileData: any;
    preferences?: any;
  }
) {
  try {
    const supabase = createClient();
    
    // Extract additional fields from profileData
    const { numberOfCreators, onlyFansLink, platforms, ...otherProfileData } = onboardingData.profileData;
    
    console.log('Onboarding data being saved:', {
      userId,
      userType: onboardingData.userType,
      profileData: otherProfileData,
      numberOfCreators,
      onlyFansLink,
      platforms,
      preferences: onboardingData.preferences
    });
    
    // First, try to save with the new columns
    let profileData = {
      id: userId,
      user_type: onboardingData.userType,
      onboarding_completed: true,
      profile_data: {
        ...otherProfileData,
        // Include the new fields in profile_data as backup
        numberOfCreators,
        onlyFansLink,
        platforms
      },
      preferences: onboardingData.preferences || {},
      updated_at: new Date().toISOString(),
    };

    // Try to include the new columns if they exist
    if (numberOfCreators || onlyFansLink || platforms) {
      profileData = {
        ...profileData,
        number_of_creators: numberOfCreators,
        onlyfans_link: onlyFansLink,
        platforms: platforms,
      } as any;
    }
    
    // Create or update user profile via API
    const response = await fetch('/api/user-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error details:', errorData);
      throw new Error(errorData.error || 'Failed to complete onboarding');
    }

    return { success: true };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { success: false, error };
  }
}
