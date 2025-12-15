'use client';

import React, { useState } from 'react';
import { Button, Input, Label, Dropdown } from '@/components/ui';
import { OnboardingData } from '@/app/onboarding/page';

interface CreatorDetailsStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function CreatorDetailsStep({ data, onNext, onBack }: CreatorDetailsStepProps) {
  const [formData, setFormData] = useState({
    onlyFansLink: data.onlyFansLink || '',
    platforms: data.platforms || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const platformOptions = [
    { value: 'OnlyFans', label: 'OnlyFans' },
    { value: 'Fansly', label: 'Fansly' },
    { value: 'ManyVids', label: 'ManyVids' },
    { value: 'Chaturbate', label: 'Chaturbate' },
    { value: 'MyFreeCams', label: 'MyFreeCams' },
    { value: 'LiveJasmin', label: 'LiveJasmin' },
    { value: 'Stripchat', label: 'Stripchat' },
    { value: 'CamSoda', label: 'CamSoda' },
    { value: 'BongaCams', label: 'BongaCams' },
    { value: 'Other', label: 'Other' }
  ];

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
          <Label htmlFor="onlyFansLink" className="text-canvas-text-contrast font-semibold">
            Only Fans Account Link <span className="text-red-500">*</span>
          </Label>
          <Input
            id="onlyFansLink"
            type="url"
            placeholder="Enter Link"
            value={formData.onlyFansLink}
            onChange={(e) => handleInputChange('onlyFansLink', e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-canvas-text-contrast font-semibold">
            Which platforms are you currently active on? <span className="text-red-500">*</span>
          </Label>
          <Dropdown
            options={platformOptions}
            value={formData.platforms}
            onChange={(value) => handleInputChange('platforms', value)}
            placeholder="Select all that apply"
            required
            className="mt-1"
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            color="gray"
            size="large"
            variant="solid"
            disabled={!formData.onlyFansLink.trim() || formData.platforms.length === 0}
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
