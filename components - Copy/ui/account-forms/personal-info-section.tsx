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

interface PersonalInfoSectionProps {
  userProfile: UserProfileType | null;
  userId: string;
}

export default function PersonalInfoSection({ userProfile, userId }: PersonalInfoSectionProps) {

  const [firstName, setFirstName] = useState(userProfile?.profile_data?.firstName || '');
  const [lastName, setLastName] = useState(userProfile?.profile_data?.lastName || '');
  const [agencyName, setAgencyName] = useState(userProfile?.profile_data?.agencyName || '');
  const [language, setLanguage] = useState(userProfile?.profile_data?.language || '');
  const [timezone, setTimezone] = useState(userProfile?.profile_data?.timezone || '');
  const [numberOfCreators, setNumberOfCreators] = useState(userProfile?.number_of_creators || '');
  const [onlyFansLink, setOnlyFansLink] = useState(userProfile?.onlyfans_link || '');
  const [platforms, setPlatforms] = useState(userProfile?.platforms || []);
  const [displayPicture, setDisplayPicture] = useState<string | null>(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  
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

  // Fetch current profile picture from users table
  useEffect(() => {
    const fetchCurrentPicture = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: userData } = await (supabase as any)
            .from('users')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
          
          if (userData?.avatar_url) {
            setCurrentProfilePicture(userData.avatar_url);
            setDisplayPicture(userData.avatar_url);
          }
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    if (userProfile?.user_type === 'creator') {
      fetchCurrentPicture();
    }
  }, [userProfile]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Track if form has been changed from original values
  const [formChanged, setFormChanged] = useState(false);
  const [pictureChanged, setPictureChanged] = useState(false);
  
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
      if (!userId) {
        throw new Error('User ID is missing');
      }

      // Upload profile picture if changed
      if (profilePictureFile && userType === 'creator') {
        setUploadingPicture(true);
        const formData = new FormData();
        formData.append('file', profilePictureFile);

        const pictureResponse = await fetch('/api/creator/profile-picture', {
          method: 'POST',
          body: formData,
        });

        if (!pictureResponse.ok) {
          const pictureError = await pictureResponse.json();
          throw new Error(pictureError.error || 'Failed to upload profile picture');
        }

        const pictureData = await pictureResponse.json();
        setCurrentProfilePicture(pictureData.url);
        setProfilePictureFile(null);
        setPictureChanged(false);
        setUploadingPicture(false);
      }

      // Prepare the updated profile data
      const updatedProfileData = {
        firstName,
        lastName,
        ...(userType === 'creator' ? { language, timezone } : {})
      };

      // Create full_name by combining first and last name
      const fullName = lastName ? `${firstName} ${lastName}` : firstName;

      // Prepare the update object
      const updateData: any = {
        profile_data: updatedProfileData,
        platforms: platforms,
        updated_at: new Date().toISOString(),
        full_name: fullName,
      };

      // Add role-specific fields
      if (userType === 'creator') {
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
      setUploadingPicture(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File too large. Maximum size is 5MB');
        return;
      }

      setProfilePictureFile(file);
      setPictureChanged(true);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setDisplayPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="overflow-visible bg-white border border-gray-200 rounded-lg">
      <div className="grid grid-cols-2">
        {/* Left section - Title and description */}
        <div className="p-8 bg-[#FCFCFC]">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">Personal Information</h2>
          <p className="text-gray-600">The information associated with your account.</p>
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
          
          {/* Display Picture - Only for creators */}
          {userType === 'creator' && (
            <div>
              <Label className="font-semibold text-gray-700">
                Display Picture
              </Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-gray-200 rounded-full">
                    {displayPicture ? (
                      <img src={displayPicture} alt="Display" className="object-cover w-full h-full" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <label htmlFor="displayPicture" className="absolute bottom-0 right-0 flex items-center justify-center w-5 h-5 bg-white border border-gray-300 rounded-full cursor-pointer hover:bg-gray-50">
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </label>
                  <input
                    id="displayPicture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Basic Information */}
          <div>
            <Label htmlFor="firstName" className="font-semibold text-gray-700">
              First name
            </Label>
            <Input 
              id="firstName" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="lastName" className="font-semibold text-gray-700">
              Last name (optional)
            </Label>
            <Input 
              id="lastName" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="mt-1"
            />
          </div>
          
          {/* Creator-specific fields */}
          {userType === 'creator' && (
            <>
              <div>
                <Label htmlFor="onlyFansLink" className="font-semibold text-gray-700">
                  Only Fans Account link <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="onlyFansLink" 
                  type="url"
                  value={onlyFansLink}
                  onChange={(e) => setOnlyFansLink(e.target.value)}
                  placeholder="https://onlyfans/creatorname/id/251513"
                  className="mt-1"
                />
              </div>
            </>
          )}
          
            <div className="flex justify-end pt-4">
              <Button 
                type="submit"
                disabled={isSubmitting || (!formChanged && !pictureChanged) || uploadingPicture}
                color="primary"
                size="medium"
                variant="solid"
              >
                {isSubmitting || uploadingPicture ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
