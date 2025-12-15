'use client';

import React, { useState, useEffect } from 'react';
import { useUserProfile } from '@/lib/utils/swr';
import { ProfilePictureUpload } from '@/components/ui';
import Image from 'next/image';

export const CreatorProfileSettingsPage: React.FC = () => {
  const { user, userData, userProfile, isLoading, mutate } = useUserProfile();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    if (userData?.avatar_url) {
      setProfilePicture(userData.avatar_url);
    }
  }, [userData]);

  const handleProfilePictureUploadSuccess = async (url: string) => {
    setProfilePicture(url);
    setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    
    // Refresh user data
    setTimeout(() => {
      mutate();
      setMessage(null);
    }, 2000);
  };

  const handleProfilePictureUploadError = (error: string) => {
    setMessage({ type: 'error', text: error });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] p-6 rounded-tl-xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFC] p-6 rounded-tl-xl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your profile picture and account settings</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Display Picture</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Current Picture Preview */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Current Picture</h3>
              {profilePicture ? (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={profilePicture}
                    alt="Current profile picture"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No picture set</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Upload Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Upload New Picture</h3>
              <ProfilePictureUpload
                currentImageUrl={profilePicture || undefined}
                onUploadSuccess={handleProfilePictureUploadSuccess}
                onUploadError={handleProfilePictureUploadError}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Tip:</span> Your profile picture will be displayed across all your profiles and public listings. Make sure it's clear and professional.
            </p>
          </div>
        </div>

        {/* Account Info Section */}
        {user && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {userData?.full_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userData.full_name}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Account ID: <span className="font-mono text-gray-400">{user.id}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
