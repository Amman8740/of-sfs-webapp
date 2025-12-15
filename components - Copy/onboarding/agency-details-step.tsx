'use client';

import React, { useState } from 'react';
import { Button, Label, Dropdown } from '@/components/ui';
import { Select } from '@/components/ui/select/select';
import { OnboardingData } from '@/app/onboarding/page';

interface AgencyDetailsStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function AgencyDetailsStep({ data, onNext, onBack }: AgencyDetailsStepProps) {
  const [formData, setFormData] = useState({
    numberOfCreators: data.numberOfCreators || '',
    platforms: data.platforms || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const creatorCountOptions = [
    '1 - 5',
    '6 - 10', 
    '10 - 30',
    '30 - 50',
    '50+'
  ];

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
        <h2 className="mb-2 text-2xl font-bold text-canvas-text-contrast">
          Get Started with OF Assist
        </h2>
        <p className="text-canvas-text">
          We would like to know more about you to help tailor your experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="numberOfCreators" className="font-semibold text-canvas-text-contrast">
            Number of creators your agency currently has <span className="text-red-500">*</span>
          </Label>
          <Select
            id="numberOfCreators"
            value={formData.numberOfCreators}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('numberOfCreators', e.target.value)}
            required
            options={creatorCountOptions.map(option => ({ value: option, label: option }))}
            placeholder="Select number of creators"
          />
        </div>

        <div>
          <Label className="font-semibold text-canvas-text-contrast">
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
            disabled={!formData.numberOfCreators || formData.platforms.length === 0}
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
