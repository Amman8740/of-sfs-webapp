'use client';

import React, { useState } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { Select } from '@/components/ui/select/select';
import { OnboardingData } from '@/app/onboarding/page';

interface CreatorSetupStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function CreatorSetupStep({ data, onNext, onBack }: CreatorSetupStepProps) {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    language: data.language || '',
    timezone: data.timezone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Russian',
    'Chinese',
    'Japanese',
    'Korean',
    'Arabic',
    'Hindi',
  ];

  const timezones = [
    'UTC-12:00 (Baker Island)',
    'UTC-11:00 (American Samoa)',
    'UTC-10:00 (Hawaii)',
    'UTC-09:00 (Alaska)',
    'UTC-08:00 (Pacific Time)',
    'UTC-07:00 (Mountain Time)',
    'UTC-06:00 (Central Time)',
    'UTC-05:00 (Eastern Time)',
    'UTC-04:00 (Atlantic Time)',
    'UTC-03:00 (Brazil)',
    'UTC-02:00 (Mid-Atlantic)',
    'UTC-01:00 (Azores)',
    'UTC+00:00 (Greenwich)',
    'UTC+01:00 (Central European)',
    'UTC+02:00 (Eastern European)',
    'UTC+03:00 (Moscow)',
    'UTC+04:00 (Gulf)',
    'UTC+05:00 (Pakistan)',
    'UTC+06:00 (Bangladesh)',
    'UTC+07:00 (Indochina)',
    'UTC+08:00 (China)',
    'UTC+09:00 (Japan)',
    'UTC+10:00 (Australia Eastern)',
    'UTC+11:00 (Solomon Islands)',
    'UTC+12:00 (New Zealand)',
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
          <Label htmlFor="firstName" className="font-semibold text-canvas-text-contrast">
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
          <Label htmlFor="lastName" className="font-semibold text-canvas-text-contrast">
            Last name <span className="font-normal text-canvas-text">(optional)</span>
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
          <Label htmlFor="language" className="font-semibold text-canvas-text-contrast">
            What Language do you speak? <span className="text-red-500">*</span>
          </Label>
          <Select
            id="language"
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            options={languages.map(lang => ({ value: lang, label: lang }))}
            placeholder="Select language"
          />
        </div>

        <div>
          <Label htmlFor="timezone" className="font-semibold text-canvas-text-contrast">
            
            What time zone are you based on? <span className="text-red-500">*</span>
          </Label>
          <Select
            id="timezone"
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            options={timezones.map(tz => ({ value: tz, label: tz }))}
            placeholder="Select time zone"
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            color="gray"
            size="large"
            variant="solid"
            disabled={!formData.firstName.trim()}
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
