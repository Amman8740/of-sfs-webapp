'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProxiedImage } from '@/components/ui';

// Mock data based on the received profile data from plugin
const mockProfileData = {
  username: 'danidanielstv',
  display_name: 'Musa Sohail',
  onlyfans_url: 'https://onlyfans.com/danidanielstv',
  fans: 4,
  posts: 459,
  media: 1886,
  photos: 0,
  videos: 0,
  likes: 28,
  subscription_type: 'Free',
  price: 0,
  verified: true,
  bio: '',
  location: '',
  website: 'https://Onlyfans.com/akaDaniDaniels',
  profile_image_url: 'https://thumbs.onlyfans.com/public/files/thumbs/c144/p/pf/pfg/pfgxqheeqydup6tojsxvcoc4punrdfpt1609967190/avatar.jpg',
  cover_image_url: 'https://public.onlyfans.com/files/s/sz/szs/szs3ij5cbrdj6w4dkqy875ibjqzoh47p1706040628/392983124/header.jpg',
  joined_date: '',
  last_seen: '459 POSTS',
  social_links: {
    youtube: 'https://youtube.com/@DaniDanielsOfficial',
    twitter: 'https://twitter.com/Akadanidaniels',
    instagram: 'https://instagram.com/Akadanidaniels'
  },
  last_updated: new Date().toISOString(),
  scraped_at: new Date().toISOString()
};

interface ProfileData {
  username: string;
  display_name: string;
  onlyfans_url: string;
  fans: number;
  posts: number;
  media: number;
  photos: number;
  videos: number;
  likes: number;
  subscription_type: string;
  price: number;
  verified: boolean;
  bio: string;
  location: string;
  website: string;
  profile_image_url: string;
  cover_image_url: string;
  joined_date: string;
  last_seen: string;
  social_links: Record<string, string>;
  last_updated: string;
  scraped_at: string;
}

export default function ProfileDemoPage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useRealData, setUseRealData] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});

  const handleImageError = (imageType: string) => {
    setImageErrors(prev => ({ ...prev, [imageType]: true }));
    setLoadingImages(prev => ({ ...prev, [imageType]: false }));
  };

  const handleImageLoad = (imageType: string) => {
    setImageErrors(prev => ({ ...prev, [imageType]: false }));
    setLoadingImages(prev => ({ ...prev, [imageType]: false }));
  };

  const handleImageLoadStart = (imageType: string) => {
    setLoadingImages(prev => ({ ...prev, [imageType]: true }));
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (useRealData) {
          const response = await fetch('/api/profile/demo');
          if (!response.ok) {
            throw new Error('Failed to fetch profile data');
          }
          const data = await response.json();
          setProfileData(data);
        } else {
          // Use mock data
          setProfileData(mockProfileData);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback to mock data on error
        setProfileData(mockProfileData);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [useRealData]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPrice = (price: number): string => {
    if (price === 0) return 'Free';
    return `$${price}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">OnlyFans Profile Demo</h1>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useRealData}
                  onChange={(e) => setUseRealData(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Use Real Data</span>
              </label>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-pink-400 to-purple-600">
        {profileData.cover_image_url && !imageErrors.cover ? (
          <ProxiedImage
            src={profileData.cover_image_url}
            alt="Cover"
            width={800}
            height={400}
            className="object-cover w-full h-full"
            userId="demo-user"
            showError={true}
          />
        ) : null}
        {imageErrors.cover && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black bg-opacity-50">
            Cover image unavailable
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="relative z-10 max-w-4xl px-4 mx-auto -mt-16">
        <div className="overflow-hidden bg-white rounded-lg shadow-lg">
          {/* Profile Header */}
          <div className="p-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 overflow-hidden bg-gray-200 border-4 border-white rounded-full md:w-32 md:h-32">
                  {profileData.profile_image_url && !imageErrors.profile ? (
                    <>
                      <ProxiedImage
                        src={profileData.profile_image_url}
                        alt={profileData.display_name}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                        userId="demo-user"
                        showError={true}
                      />
                      <div className="absolute inset-0 w-full h-full text-2xl font-bold text-gray-600 bg-gray-300 rounded-full fallback-avatar opacity-0 transition-opacity">
                        {profileData.display_name.charAt(0).toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-gray-600 bg-gray-300">
                      {profileData.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {profileData.verified && (
                  <div className="absolute flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full -bottom-1 -right-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profileData.display_name}</h2>
                    <p className="text-gray-600">@{profileData.username}</p>
                    {profileData.last_seen && (
                      <p className="mt-1 text-sm text-gray-500">{profileData.last_seen}</p>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0">
                    <a
                      href={profileData.onlyfans_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-2 text-white transition-colors bg-pink-600 rounded-full hover:bg-pink-700"
                    >
                      View on OnlyFans
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Bio */}
                {profileData.bio && (
                  <p className="mt-4 text-gray-700">{profileData.bio}</p>
                )}

                {/* Location & Website */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  {profileData.location && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profileData.location}
                    </div>
                  )}
                  {profileData.website && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profileData.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {profileData.social_links && Object.keys(profileData.social_links).length > 0 && (
                  <div className="flex gap-3 mt-4">
                    {Object.entries(profileData.social_links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <span className="capitalize">{platform}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-6 py-8 bg-gray-50">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(profileData.fans)}</div>
                <div className="text-sm text-gray-600">Fans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(profileData.posts)}</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(profileData.media)}</div>
                <div className="text-sm text-gray-600">Media</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(profileData.likes)}</div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">Subscription:</span>
                  <span className="ml-2 font-medium text-gray-900">{profileData.subscription_type}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="ml-2 font-medium text-gray-900">{formatPrice(profileData.price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Data Section */}
          <div className="px-6 py-6 border-t border-gray-200">
            <details className="group">
              <summary className="flex items-center text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                <svg className="w-4 h-4 mr-2 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                View Raw Data
              </summary>
              <div className="p-4 mt-4 overflow-x-auto rounded-lg bg-gray-50">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(profileData, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl px-4 py-8 mx-auto text-sm text-center text-gray-500">
        <p>This is a demo page for testing OnlyFans profile data display.</p>
        <p className="mt-2">
          Last updated: {new Date(profileData.last_updated).toLocaleString()}
        </p>
      </div>
    </div>
  );
}