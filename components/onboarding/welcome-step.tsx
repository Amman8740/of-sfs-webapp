'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { OnboardingData, UserType } from '@/app/onboarding/page';

interface WelcomeStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const [selectedType, setSelectedType] = useState<UserType>('agency');

  const handleNext = () => {
    onNext({ userType: selectedType });
  };

  return (
    <div>
      {/* Welcome Content */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-canvas-text-contrast mb-4">
          Welcome! Let's Get Started.
        </h1>
        <p className="text-canvas-text text-lg leading-relaxed">
          A few quick questions to personalize your account and make the most of OF Assist.
        </p>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-canvas-text-contrast mb-6">
          Are you an agency or creator?
        </h2>
        
        <div className="space-y-4">
          {/* Agency Option */}
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="radio"
              name="userType"
              value="agency"
              checked={selectedType === 'agency'}
              onChange={() => setSelectedType('agency')}
              className="w-5 h-5 text-primary-solid border-2 border-canvas-border rounded-full focus:outline-none focus:ring-0"
            />
            <span className="text-lg font-medium text-canvas-text-contrast group-hover:text-primary-text transition-colors">
              Agency
            </span>
          </label>

          {/* Creator Option */}
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="radio"
              name="userType"
              value="creator"
              checked={selectedType === 'creator'}
              onChange={() => setSelectedType('creator')}
              className="w-5 h-5 text-primary-solid border-2 border-canvas-border rounded-full focus:outline-none focus:ring-0"
            />
            <span className="text-lg font-medium text-canvas-text-contrast group-hover:text-primary-text transition-colors">
              Creator
            </span>
          </label>
        </div>
      </div>

      {/* Next Button */}
      <Button
        color="gray"
        size="large"
        variant="solid"
        onClick={handleNext}
        className="w-full"
        style={{ backgroundColor: '#0091FF' }}
      >
        Next
      </Button>
    </div>
  );
}
