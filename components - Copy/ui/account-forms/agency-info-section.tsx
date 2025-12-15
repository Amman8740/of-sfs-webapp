'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/utils/supabase/client';
import { Input, Label, Button, Dropdown, Select } from '@/components/ui';

interface UserProfileType {
  id: string;
  user_type?: 'agency' | 'creator';
  profile_data?: {
    firstName?: string;
    lastName?: string;
    agencyName?: string;
    language?: string;
    timezone?: string;
  };
  number_of_creators?: string;
  onlyfans_link?: string;
  platforms?: string[];
}

interface AgencyInfoSectionProps {
  userProfile: UserProfileType | null;
  userId: string;
}

export default function AgencyInfoSection({ userProfile, userId }: AgencyInfoSectionProps) {

  const [firstName, setFirstName] = useState(userProfile?.profile_data?.firstName || '');
  const [lastName, setLastName] = useState(userProfile?.profile_data?.lastName || '');
  const [agencyName, setAgencyName] = useState(userProfile?.profile_data?.agencyName || '');
  const [language, setLanguage] = useState(userProfile?.profile_data?.language || '');
  const [timezone, setTimezone] = useState(userProfile?.profile_data?.timezone || '');
  const [numberOfCreators, setNumberOfCreators] = useState(userProfile?.number_of_creators || '');
  const [onlyFansLink, setOnlyFansLink] = useState(userProfile?.onlyfans_link || '');
  const [platforms, setPlatforms] = useState(userProfile?.platforms || []);
  
  // Update form fields when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.profile_data?.firstName || '');
      setLastName(userProfile.profile_data?.lastName || '');
      setAgencyName(userProfile.profile_data?.agencyName || '');
      setLanguage(userProfile.profile_data?.language || '');
      setTimezone(userProfile.profile_data?.timezone || '');
      setNumberOfCreators(userProfile.number_of_creators || '');
      setOnlyFansLink(userProfile.onlyfans_link || '');
      setPlatforms(userProfile.platforms || []);
    }
  }, [userProfile]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Track if form has been changed from original values
  const [formChanged, setFormChanged] = useState(false);
  
  const userType = userProfile?.user_type || 'creator';
  
  // Check if fields have changed from their original values
  useEffect(() => {
    const hasChanged = 
      firstName !== (userProfile?.profile_data?.firstName || '') ||
      lastName !== (userProfile?.profile_data?.lastName || '') ||
      agencyName !== (userProfile?.profile_data?.agencyName || '') ||
      language !== (userProfile?.profile_data?.language || '') ||
      timezone !== (userProfile?.profile_data?.timezone || '') ||
      numberOfCreators !== (userProfile?.number_of_creators || '') ||
      onlyFansLink !== (userProfile?.onlyfans_link || '') ||
      JSON.stringify(platforms) !== JSON.stringify(userProfile?.platforms || []);
    
    setFormChanged(hasChanged);
  }, [firstName, lastName, agencyName, language, timezone, numberOfCreators, onlyFansLink, platforms, userProfile]);

  const creatorCountOptions = [
    { value: '1-5', label: '1 - 5' },
    { value: '6-10', label: '6 - 10' },
    { value: '10-30', label: '10 - 30' },
    { value: '30-50', label: '30 - 50' },
    { value: '50+', label: '50+' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Korean', label: 'Korean' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'Hindi', label: 'Hindi' }
  ];

  const timezoneOptions = [
    { value: 'UTC-12:00 (Baker Island)', label: 'UTC-12:00 (Baker Island)' },
    { value: 'UTC-11:00 (American Samoa)', label: 'UTC-11:00 (American Samoa)' },
    { value: 'UTC-10:00 (Hawaii)', label: 'UTC-10:00 (Hawaii)' },
    { value: 'UTC-09:00 (Alaska)', label: 'UTC-09:00 (Alaska)' },
    { value: 'UTC-08:00 (Pacific Time)', label: 'UTC-08:00 (Pacific Time)' },
    { value: 'UTC-07:00 (Mountain Time)', label: 'UTC-07:00 (Mountain Time)' },
    { value: 'UTC-06:00 (Central Time)', label: 'UTC-06:00 (Central Time)' },
    { value: 'UTC-05:00 (Eastern Time)', label: 'UTC-05:00 (Eastern Time)' },
    { value: 'UTC-04:00 (Atlantic Time)', label: 'UTC-04:00 (Atlantic Time)' },
    { value: 'UTC-03:00 (Brazil)', label: 'UTC-03:00 (Brazil)' },
    { value: 'UTC-02:00 (Mid-Atlantic)', label: 'UTC-02:00 (Mid-Atlantic)' },
    { value: 'UTC-01:00 (Azores)', label: 'UTC-01:00 (Azores)' },
    { value: 'UTC+00:00 (Greenwich)', label: 'UTC+00:00 (Greenwich)' },
    { value: 'UTC+01:00 (Central European)', label: 'UTC+01:00 (Central European)' },
    { value: 'UTC+02:00 (Eastern European)', label: 'UTC+02:00 (Eastern European)' },
    { value: 'UTC+03:00 (Moscow)', label: 'UTC+03:00 (Moscow)' },
    { value: 'UTC+04:00 (Gulf)', label: 'UTC+04:00 (Gulf)' },
    { value: 'UTC+05:00 (Pakistan)', label: 'UTC+05:00 (Pakistan)' },
    { value: 'UTC+06:00 (Bangladesh)', label: 'UTC+06:00 (Bangladesh)' },
    { value: 'UTC+07:00 (Indochina)', label: 'UTC+07:00 (Indochina)' },
    { value: 'UTC+08:00 (China)', label: 'UTC+08:00 (China)' },
    { value: 'UTC+09:00 (Japan)', label: 'UTC+09:00 (Japan)' },
    { value: 'UTC+10:00 (Australia Eastern)', label: 'UTC+10:00 (Australia Eastern)' },
    { value: 'UTC+11:00 (Solomon Islands)', label: 'UTC+11:00 (Solomon Islands)' },
    { value: 'UTC+12:00 (New Zealand)', label: 'UTC+12:00 (New Zealand)' }
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

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');
    
    try {
      const supabase = createClient();
      
      if (!userId) {
        throw new Error('User ID is missing');
      }

      // Prepare the updated profile data
      const updatedProfileData = {
        firstName,
        lastName,
        ...(userType === 'agency' ? { agencyName } : { language, timezone })
      };

      // Prepare the update object
      const updateData: any = {
        profile_data: updatedProfileData,
        platforms: platforms,
        updated_at: new Date().toISOString(),
      };

      // Add role-specific fields
      if (userType === 'agency') {
        updateData.number_of_creators = numberOfCreators;
      } else {
        updateData.onlyfans_link = onlyFansLink;
      }
      
      // Update the user profile via API
      const response = await fetch('/api/user-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
        
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error details:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const result = await response.json();
      if (!result.success) {
        setError('No changes were made. Please try again or contact support.');
        return;
      }
      
      console.log('Update successful:', result.data);
      setMessage('Information updated successfully!');
    } catch (error: any) {
      console.error('Error updating information:', error);
      setError(`Failed to update information: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-visible bg-white border border-gray-200 rounded-lg">
      <div className="grid grid-cols-2">
        {/* Left section - Title and description */}
        <div className="p-8 bg-[#FCFCFC]">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">Agency Information</h2>
          <p className="text-gray-600">The information associated with your agency.</p>
        </div>
        
        {/* Right section - Form */}
        <div className="p-8 overflow-visible bg-white">
          <form className="space-y-6" onSubmit={handleSaveInfo}>
          {message && (
            <div className="p-3 text-sm text-green-700 border border-green-200 rounded bg-green-50">
              {message}
            </div>
          )}
          
          {error && (
            <div className="p-3 text-sm text-red-700 border border-red-200 rounded bg-red-50">
              {error}
            </div>
          )}

          {/* Role-specific fields */}
          {userType === 'agency' ? (
            <>
              <div>
                <Label htmlFor="agencyName" className="font-semibold text-gray-700">
                  Agency Name
                </Label>
                <Input 
                  id="agencyName" 
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="relative z-10">
                <Label className="font-semibold text-gray-700">
                  Number of Creators
                </Label>
                <Select
                  value={numberOfCreators}
                  onChange={(e) => setNumberOfCreators(e.target.value)}
                  options={creatorCountOptions}
                  placeholder="Select number of creators"
                  className="h-10 mt-1"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="onlyFansLink" className="font-semibold text-gray-700">
                  OnlyFans Account Link
                </Label>
                <Input 
                  id="onlyFansLink" 
                  type="url"
                  value={onlyFansLink}
                  onChange={(e) => setOnlyFansLink(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="font-semibold text-gray-700">
                  Language
                </Label>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  options={languageOptions}
                  placeholder="Select language"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="font-semibold text-gray-700">
                  Timezone
                </Label>
                <Select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  options={timezoneOptions}
                  placeholder="Select timezone"
                  className="mt-1"
                />
              </div>
            </>
          )}
          
          {/* Platforms */}
          <div className="relative">
            <Label className="font-semibold text-gray-700">
              Active Platforms
            </Label>
            <Dropdown
              options={platformOptions}
              value={platforms}
              onChange={setPlatforms}
              placeholder="Select platforms you're active on"
              className="mt-1"
            />
          </div>
          
            <div className="flex justify-end pt-4">
              <Button 
                type="submit"
                disabled={isSubmitting || !formChanged}
                color="primary"
                size="medium"
                variant="solid"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
