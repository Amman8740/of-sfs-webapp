'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { Logo } from '@/components/ui/icons';
import { completeOnboardingClient } from '@/lib/utils/onboarding-client';
import { createClient } from '@/lib/utils/supabase/client';

// Onboarding step components
import { 
  WelcomeStep, 
  UserTypeStep, 
  AgencySetupStep, 
  CreatorSetupStep, 
  AgencyDetailsStep,
  CreatorDetailsStep,
  CompletionStep 
} from '@/components/onboarding';

export type UserType = 'agency' | 'creator';

export interface OnboardingData {
  userType?: UserType;
  firstName?: string;
  lastName?: string;
  agencyName?: string;
  agencyDescription?: string;
  creatorName?: string;
  creatorBio?: string;
  language?: string;
  timezone?: string;
  numberOfCreators?: string;
  onlyFansLink?: string;
  platforms?: string[];
  preferences?: {
    notifications: boolean;
    marketing: boolean;
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSteps = () => [
    { component: WelcomeStep, title: 'Welcome' },
    { component: onboardingData.userType === 'agency' ? AgencySetupStep : CreatorSetupStep, title: 'Setup Profile' },
    { component: onboardingData.userType === 'agency' ? AgencyDetailsStep : CreatorDetailsStep, title: 'Additional Details' },
    { component: CompletionStep, title: 'Complete' },
  ];

  const steps = getSteps();

  const handleNext = async (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Onboarding complete - save data and redirect
      await handleCompleteOnboarding();
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!onboardingData.userType) return;
    
    setIsCompleting(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare profile data based on user type
      const profileData = onboardingData.userType === 'agency' 
        ? {
            firstName: onboardingData.firstName,
            lastName: onboardingData.lastName,
            agencyName: onboardingData.agencyName,
            numberOfCreators: onboardingData.numberOfCreators,
            platforms: onboardingData.platforms,
          }
        : {
            firstName: onboardingData.firstName,
            lastName: onboardingData.lastName,
            language: onboardingData.language,
            timezone: onboardingData.timezone,
            onlyFansLink: onboardingData.onlyFansLink,
            platforms: onboardingData.platforms,
          };

      // Save onboarding data
      const result = await completeOnboardingClient(user.id, {
        userType: onboardingData.userType,
        profileData,
        preferences: onboardingData.preferences,
      });

      if (result.success) {
        // Redirect to appropriate dashboard
        const redirectPath = onboardingData.userType === 'agency' ? '/agency' : '/creator';
        router.push(redirectPath);
      } else {
        console.error('Failed to complete onboarding:', result.error);
        setError('Failed to complete onboarding. Please try again.');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen flex px-6">
      {/* Left Panel - Image */}
      <div className="w-1/2 relative flex items-center justify-center">
        <img 
          src="/assets/images/onboarding/image.png" 
          alt="Onboarding Preview" 
          className="max-w-full max-h-full object-contain rounded-xl"
        />
      </div>

      {/* Right Panel - Logo and Onboarding Content */}
      <div className="w-1/2 flex flex-col px-16 py-12 ml-6">
        {/* Logo - Outside content div */}
        <div className="mb-8">
          <Logo />
        </div>
        
        {/* Content - Centered in remaining space */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full">
                  <CurrentStepComponent
                    data={onboardingData}
                    onNext={handleNext}
                    onBack={handleBack}
                    isFirstStep={currentStep === 0}
                    isLastStep={currentStep === steps.length - 1}
                    isCompleting={isCompleting}
                    error={error}
                  />
          </div>
        </div>
      </div>
    </div>
  );
}
