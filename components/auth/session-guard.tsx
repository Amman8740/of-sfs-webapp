'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStatus } from '@/lib/utils/swr/onboarding-status';

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const router = useRouter();
  const { needsOnboarding, isLoading, error } = useOnboardingStatus();

  useEffect(() => {
    // If there's an error, redirect to signin
    if (error && !isLoading) {
      console.log('Session validation failed, redirecting to signin...');
      router.push('/signin');
      return;
    }

    // If user needs onboarding, redirect to onboarding
    if (!isLoading && needsOnboarding) {
      console.log('User needs onboarding, redirecting to onboarding...');
      router.push('/onboarding');
      return;
    }
  }, [needsOnboarding, isLoading, error, router]);

  // Show loading while checking status
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-solid mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if there's an error or needs onboarding - the redirect will happen
  if (error || needsOnboarding) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-solid mx-auto mb-4"></div>
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
