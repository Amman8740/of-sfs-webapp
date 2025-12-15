'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { OnboardingData, UserType } from '@/app/onboarding/page';

interface UserTypeStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function UserTypeStep({ data, onNext, onBack }: UserTypeStepProps) {
  const [selectedType, setSelectedType] = useState<UserType | null>(data.userType || null);

  const handleNext = () => {
    if (selectedType) {
      onNext({ userType: selectedType });
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-canvas-text-contrast mb-2">
          What best describes you?
        </h2>
        <p className="text-canvas-text">
          Choose the option that best fits your role
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Agency Option */}
        <div
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
            selectedType === 'agency'
              ? 'border-primary-border bg-primary-bg-subtle'
              : 'border-canvas-border hover:border-primary-border hover:bg-primary-bg-subtle'
          }`}
          onClick={() => setSelectedType('agency')}
        >
          <div className="flex items-start space-x-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedType === 'agency' 
                ? 'border-primary-solid bg-primary-solid' 
                : 'border-canvas-border'
            }`}>
              {selectedType === 'agency' && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-canvas-text-contrast mb-2">
                Agency
              </h3>
              <p className="text-canvas-text">
                I manage multiple creators and need tools to organize, schedule, and optimize content across different accounts.
              </p>
              <ul className="mt-3 text-sm text-canvas-text space-y-1">
                <li>• Manage multiple creator accounts</li>
                <li>• Schedule and organize content</li>
                <li>• Track performance analytics</li>
                <li>• Collaborate with team members</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Client Option */}
        <div
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
            selectedType === 'creator'
              ? 'border-primary-border bg-primary-bg-subtle'
              : 'border-canvas-border hover:border-primary-border hover:bg-primary-bg-subtle'
          }`}
          onClick={() => setSelectedType('creator')}
        >
          <div className="flex items-start space-x-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedType === 'creator' 
                ? 'border-primary-solid bg-primary-solid' 
                : 'border-canvas-border'
            }`}>
              {selectedType === 'creator' && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-canvas-text-contrast mb-2">
                Content Creator
              </h3>
              <p className="text-canvas-text">
                I'm a content creator looking for tools to manage my own content, schedule posts, and grow my audience.
              </p>
              <ul className="mt-3 text-sm text-canvas-text space-y-1">
                <li>• Manage your own content</li>
                <li>• Schedule posts and stories</li>
                <li>• Track your growth</li>
                <li>• Connect with your audience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          color="gray"
          size="medium"
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          size="medium"
          variant="solid"
          onClick={handleNext}
          disabled={!selectedType}
          style={{ backgroundColor: '#0091FF' }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
