'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/client';
import { checkOnboardingStatusClient } from '@/lib/utils/onboarding-client';

interface OnboardingGuardProps {
  children: React.ReactNode;
  requiredUserType?: 'agency' | 'creator';
}

export function OnboardingGuard({ children, requiredUserType }: OnboardingGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/signin');
          return;
        }

        // Check onboarding status
        const onboardingStatus = await checkOnboardingStatusClient(user.id);
        
        if (onboardingStatus.needsOnboarding) {
          // User hasn't completed onboarding
          router.push('/onboarding');
          return;
        }

        // Check if user type matches required type
        if (requiredUserType && onboardingStatus.userType !== requiredUserType) {
          // User type doesn't match, redirect to appropriate dashboard
          const redirectPath = onboardingStatus.userType === 'agency' ? '/agency' : '/creator';
          router.push(redirectPath);
          return;
        }

        // User is authorized to access this page
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking access:', error);
        router.push('/signin');
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [router, requiredUserType]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-canvas-on-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-solid mx-auto mb-4"></div>
          <p className="text-canvas-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
