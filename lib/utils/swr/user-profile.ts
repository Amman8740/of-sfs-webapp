import useSWR from 'swr';

interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

interface UserData {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  billing_address?: any;
  payment_method?: any;
  [key: string]: any;
}

interface UserProfile {
  id: string;
  user_type?: 'agency' | 'creator';
  onboarding_completed?: boolean;
  profile_data?: any;
  number_of_creators?: string;
  onlyfans_link?: string;
  platforms?: string[];
  [key: string]: any;
}

interface UserProfileResponse {
  user: User;
  userData: UserData;
  userProfile: UserProfile;
}

const fetcher = async (url: string): Promise<UserProfileResponse> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 401 || response.status === 404) {
      // User is not authenticated or not found in database, clear session and redirect
      try {
        await fetch('/api/auth/signout', { method: 'POST' });
      } catch (error) {
        console.error('Error signing out:', error);
      }
      window.location.href = '/signin';
      throw new Error('User not found or unauthorized');
    }
    const errorText = await response.text();
    throw new Error(`Failed to fetch user profile: ${errorText}`);
  }
  
  return response.json();
};

export const useUserProfile = () => {
  const { data, error, mutate, isLoading } = useSWR<UserProfileResponse>(
    '/api/user-profile',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    user: data?.user,
    userData: data?.userData,
    userProfile: data?.userProfile,
    isLoading,
    error,
    mutate,
  };
};
