'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/lib/utils/swr';
import { OnboardingGuard } from '@/components/onboarding/onboarding-guard';
import { ContentSwitcher } from '@/components/features';
import { NavigationProvider, useNavigation } from '@/components/layout/navigation-context';
import { navigationEvents, NAVIGATION_EVENTS } from '@/lib/utils/navigation-events';
import PersonalInfoSection from '@/components/ui/account-forms/personal-info-section';
import PasswordSection from '@/components/ui/account-forms/password-section';
import LogoutSection from '@/components/ui/account-forms/logout-section';
import NextTopLoader from 'nextjs-toploader';
import { OvalSpinner } from '@/components/ui';

interface UnifiedDashboardProps {
  initialPage?: 'agency' | 'creator' | 'account';
  initialOption?: string;
  requiredUserType?: 'agency' | 'creator';
  modelId?: string;
  modelUserId?: string;
  initialModelData?: any;
  modelsData?: any[];
}

function DashboardContent({ requiredUserType, modelsData, initialOption, modelId, modelUserId, initialModelData }: { requiredUserType?: 'agency' | 'creator'; modelsData?: any[]; initialOption: string; modelId?: string; modelUserId?: string; initialModelData?: any }) {
  const { user, userData, userProfile, isLoading: loading, error } = useUserProfile();
  
  // Determine userType from userProfile
  const currentUserType = userProfile?.user_type as 'agency' | 'creator' | undefined;
  const { currentPage, selectedOption, setCurrentPage, setSelectedOption } = useNavigation();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      router.push('/signin');
    }
  }, [error, router]);

  useEffect(() => {
    const handleSwitchToAccount = () => {
      setCurrentPage('account');
      setSelectedOption('account');
    };

    const handleSwitchToAgency = () => {
      setCurrentPage('agency');
      setSelectedOption('models');
    };

    const handleSwitchToCreator = () => {
      setCurrentPage('creator');
      setSelectedOption('profile');
    };

    navigationEvents.on(NAVIGATION_EVENTS.SWITCH_TO_ACCOUNT, handleSwitchToAccount);
    navigationEvents.on(NAVIGATION_EVENTS.SWITCH_TO_AGENCY, handleSwitchToAgency);
    navigationEvents.on(NAVIGATION_EVENTS.SWITCH_TO_CLIENT, handleSwitchToCreator);

    return () => {
      navigationEvents.off(NAVIGATION_EVENTS.SWITCH_TO_ACCOUNT, handleSwitchToAccount);
      navigationEvents.off(NAVIGATION_EVENTS.SWITCH_TO_AGENCY, handleSwitchToAgency);
      navigationEvents.off(NAVIGATION_EVENTS.SWITCH_TO_CLIENT, handleSwitchToCreator);
    };
  }, [setCurrentPage, setSelectedOption]);

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);

    // Determine which page to show based on option
    switch (option) {
      case 'models':
      case 'scheduler':
      case 'promo-links':
      case 'media-upload':
      case 'notifications':
        setCurrentPage('agency');
        break;
      case 'profile':
      case 'account':
        setCurrentPage('account');
        break;
      default:
        setCurrentPage('agency');
    }
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <OvalSpinner size="large" className="mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Default to agency/client content
    console.log('UnifiedDashboard - Passing data:', { user, userData, userProfile, userType: currentUserType, initialOption });
    return (
      <div className="overflow-y-auto">
        <ContentSwitcher
  selectedOption={selectedOption}
  data={{ userData, userProfile }}
  mutateFunctions={{}}
  modelsData={modelsData}
  userType={currentUserType}
  modelId={modelId}
  modelUserId={modelUserId}
  initialModelData={initialModelData}
/>
      </div>
    );
  };



  if (!user) {
    return null;
  }

  const userType = userProfile?.user_type || 'creator';

  return (
    // <OnboardingGuard requiredUserType={requiredUserType}>
      <div className="flex flex-col flex-1 bg-canvas-bg-subtle rounded-tl-xl">
        {renderMainContent()}
      </div>
    // </OnboardingGuard>
  );
}

export default function UnifiedDashboard({
  initialPage = 'agency',
  initialOption,
  requiredUserType,
  modelId,
  modelUserId,
  initialModelData,
  modelsData
}: UnifiedDashboardProps) {
  // Determine default option based on user type
  const getDefaultOption = () => {
    if (initialOption) return initialOption;
    if (initialPage === 'account') return 'account';
    if (requiredUserType === 'creator') return 'profile';
    return 'models'; // default for agency
  };

  const defaultOption = getDefaultOption();

  return (
    <>
      <NextTopLoader color="#0091ff" showSpinner={false} />
      <NavigationProvider initialPage={initialPage} initialOption={defaultOption}>
        <DashboardContent requiredUserType={requiredUserType} modelsData={modelsData} initialOption={defaultOption} modelId={modelId} modelUserId={modelUserId} initialModelData={initialModelData} />
      </NavigationProvider>
    </>
  );
}
