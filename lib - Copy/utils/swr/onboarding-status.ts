import useSWR from 'swr';

interface OnboardingStatus {
  needsOnboarding: boolean;
  isComplete: boolean;
  userType?: 'agency' | 'creator' | null;
}

const fetcher = async (url: string): Promise<OnboardingStatus> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 401) {
      // User is not authenticated, redirect to signin
      window.location.href = '/signin';
      throw new Error('Unauthorized');
    }
    const errorText = await response.text();
    throw new Error(`Failed to fetch onboarding status: ${errorText}`);
  }
  
  return response.json();
};

export const useOnboardingStatus = () => {
  const { data, error, mutate, isLoading } = useSWR<OnboardingStatus>(
    '/api/onboarding-status',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Debug logging
  if (data?.needsOnboarding) {
    console.log('User needs onboarding');
  }

  return {
    needsOnboarding: data?.needsOnboarding || false,
    isComplete: data?.isComplete || false,
    userType: data?.userType,
    isLoading,
    error,
    mutate,
  };
};
