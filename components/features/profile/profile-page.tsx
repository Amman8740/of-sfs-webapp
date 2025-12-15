'use client';

import React, { useState, useEffect } from 'react';
import { useUserProfile } from '@/lib/utils/swr';

interface ProfilePageProps {
  data?: Record<string, unknown>[] | null;
  mutateData?: () => void;
}

interface VaultItem {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  caption?: string;
  category?: string;
  hashtags?: string[];
  tag_creators?: string[];
  notes?: string;
  status?: string;
  created_at?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ data, mutateData }) => {
  const { userProfile, isLoading: loading } = useUserProfile();
  const [activeTab, setActiveTab] = useState<'profile' | 'vault'>('profile');
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [vaultLoading, setVaultLoading] = useState(false);

  // Fetch vault items when vault tab is active
  useEffect(() => {
    if (activeTab === 'vault') {
      fetchVaultItems();
    }
  }, [activeTab]);

  const fetchVaultItems = async () => {
    setVaultLoading(true);
    try {
      const response = await fetch('/api/vault');
      if (response.ok) {
        const result = await response.json();
        setVaultItems(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching vault items:', error);
    } finally {
      setVaultLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 min-h-screen p-6 bg-[#FCFCFC] rounded-tl-xl">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-[#FCFCFC] rounded-tl-xl p-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex-1 px-6 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'vault'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Vault Media
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && userProfile && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Your Profile</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {userProfile.user_type === 'agency' ? 'Agency' : 'Creator'}
                </span>
              </div>
            
            <div className="grid gap-6">
              {/* Basic Information */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProfile.profile_data?.firstName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">First Name</label>
                      <p className="text-gray-900">{userProfile.profile_data.firstName}</p>
                    </div>
                  )}
                  {userProfile.profile_data?.lastName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Name</label>
                      <p className="text-gray-900">{userProfile.profile_data.lastName}</p>
                    </div>
                  )}
                  {userProfile.profile_data?.agencyName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Agency Name</label>
                      <p className="text-gray-900">{userProfile.profile_data.agencyName}</p>
                    </div>
                  )}
                  {userProfile.profile_data?.language && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Language</label>
                      <p className="text-gray-900">{userProfile.profile_data.language}</p>
                    </div>
                  )}
                  {userProfile.profile_data?.timezone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Timezone</label>
                      <p className="text-gray-900">{userProfile.profile_data.timezone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Platform Information */}
              {(userProfile.platforms && userProfile.platforms.length > 0) && (
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Active Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.platforms.map((platform: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {userProfile.number_of_creators && (
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Agency Details</h4>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Number of Creators</label>
                    <p className="text-gray-900">{userProfile.number_of_creators}</p>
                  </div>
                </div>
              )}

              {userProfile.onlyfans_link && (
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Creator Details</h4>
                  <div>
                    <label className="text-sm font-medium text-gray-500">OnlyFans Link</label>
                    <p className="text-gray-900">
                      <a href={userProfile.onlyfans_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {userProfile.onlyfans_link}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Account Status</h4>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${userProfile.onboarding_completed ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  <span className="text-sm text-gray-600">
                    {userProfile.onboarding_completed ? 'Onboarding Complete' : 'Onboarding Pending'}
                  </span>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* Vault Tab */}
          {activeTab === 'vault' && (
            <div className="space-y-6">
              {vaultLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Loading vault media...</span>
                </div>
              ) : vaultItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vaultItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 aspect-square flex items-center justify-center">
                        {item.file_url ? (
                          <img
                            src={item.file_url}
                            alt={item.file_name || 'Vault item'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-2 truncate">{item.file_name}</h4>
                        {item.caption && <p className="text-sm text-gray-600 mb-2">{item.caption}</p>}
                        {item.category && <p className="text-xs text-gray-500 mb-2">Category: {item.category}</p>}
                        <div className="flex gap-2 mb-2">
                          {item.status && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {item.status}
                            </span>
                          )}
                          {item.file_type && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                              {item.file_type}
                            </span>
                          )}
                        </div>
                        {item.hashtags && item.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.hashtags.map((tag, idx) => (
                              <span key={idx} className="text-xs text-blue-600">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No vault media</h3>
                  <p className="text-gray-500">You haven&apos;t uploaded any media to your vault yet.</p>
                </div>
              )}
            </div>
          )}

          {/* No Profile */}
          {activeTab === 'profile' && !userProfile && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to OF Assist!</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Your profile is being set up. This is where you&apos;ll manage your account settings, preferences, and personal information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
