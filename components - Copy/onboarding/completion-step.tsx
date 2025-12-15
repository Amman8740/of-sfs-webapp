'use client';

import React, { useState } from 'react';
import { Button, Label } from '@/components/ui';
import { OnboardingData } from '@/app/onboarding/page';

interface CompletionStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isCompleting?: boolean;
  error?: string | null;
}

export function CompletionStep({ data, onNext, isCompleting = false, error }: CompletionStepProps) {
  const [preferences, setPreferences] = useState({
    notifications: true,
    marketing: false,
  });

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleComplete = () => {
    onNext({ preferences });
  };

  return (
    <div className="text-left">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-canvas-text-contrast mb-4">
          Account created!
        </h2>
        <p className="text-canvas-text text-lg mb-8">
          Welcome aboard! Start your success journey with OF Assist!
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <Button
        color="gray"
        size="large"
        variant="solid"
        onClick={handleComplete}
        loading={isCompleting}
        disabled={isCompleting}
        className="w-full"
        style={{ backgroundColor: '#0091FF' }}
      >
        {isCompleting ? 'Completing Setup...' : 'Lets Start'}
      </Button>
    </div>
  );
}
