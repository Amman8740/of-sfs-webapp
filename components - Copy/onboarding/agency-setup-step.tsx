'use client';

import React, { useState } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { OnboardingData } from '@/app/onboarding/page';

interface AgencySetupStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function AgencySetupStep({ data, onNext, onBack }: AgencySetupStepProps) {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    agencyName: data.agencyName || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-canvas-text-contrast mb-2">
          Get Started with OF Assist
        </h2>
        <p className="text-canvas-text">
          We would like to know more about you to help tailor your experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="firstName" className="text-canvas-text-contrast font-semibold">
            First name
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="lastName" className="text-canvas-text-contrast font-semibold">
            Last name <span className="text-canvas-text font-normal">(optional)</span>
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="agencyName" className="text-canvas-text-contrast font-semibold">
            Agency name
          </Label>
          <Input
            id="agencyName"
            type="text"
            placeholder="Agency name"
            value={formData.agencyName}
            onChange={(e) => handleInputChange('agencyName', e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            size="large"
            variant="solid"
            disabled={!formData.firstName.trim() || !formData.agencyName.trim()}
            className="w-full"
            style={{ backgroundColor: '#0091FF' }}
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
