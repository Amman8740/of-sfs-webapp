'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/lib/utils/swr';
import PersonalInfoSection from '@/components/ui/account-forms/personal-info-section';
import PasswordSection from '@/components/ui/account-forms/password-section';
import LogoutSection from '@/components/ui/account-forms/logout-section';
import { OvalSpinner } from '@/components/ui';
import AgencyInfoSection from '@/components/ui/account-forms/agency-info-section';
import AgencyCodeSection from '@/components/ui/account-forms/agency-code-section';
import AddAgencySection from '@/components/ui/account-forms/add-agency';

export const AccountPage: React.FC = () => {
  const { user, userProfile, isLoading: loading, error } = useUserProfile();
  const router = useRouter();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (error) {
      router.push('/signin');
    }
  }, [error, router]);

  useEffect(() => {
    // Simulate initial loading to trigger NextTopLoader
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000); // Increased to 2 seconds to see the loader
    return () => clearTimeout(timer);
  }, []);

  if (loading || isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FCFCFC] rounded-tl-xl">
        <div className="text-center">
          <OvalSpinner size="large" className="mb-4" />
          <p className="text-gray-600">Loading account settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col p-6 bg-[#FCFCFC] rounded-tl-xl">
      <div className="px-8 py-6 border-b">
        <h1 className="text-3xl font-semibold text-gray-900">Account Settings</h1>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        <PersonalInfoSection userProfile={userProfile || null} userId={user?.id || ''} />
        {userProfile?.user_type === 'agency' && (
          <>
            <AgencyCodeSection userId={user?.id || ''} />
            <AgencyInfoSection userProfile={userProfile || null} userId={user?.id || ''} />
          </>
        )}
        <PasswordSection />
        {userProfile?.user_type === 'creator' && (
          <AddAgencySection />
        )}
        <LogoutSection />
      </div>
    </div>
  );
};
