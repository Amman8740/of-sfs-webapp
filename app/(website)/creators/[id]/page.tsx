'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Model {
  id: string;
  name: string;
  username: string;
  email: string;
  display_picture_url?: string;
  onlyfans_link?: string;
  telegram_link?: string;
  fan_count: number;
  subscription_type: string;
  is_verified: boolean;
  verification_date?: string;
  language?: string;
  timezone?: string;
  price?: number;
  status: string;
  created_at: string;
}

export default function CreatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params?.id as string;

  const [model, setModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (creatorId) {
      fetchCreatorDetails();
    }
  }, [creatorId]);

  const fetchCreatorDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/models/public?id=${creatorId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch creator details');
      }

      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setModel(data.data[0]);
      } else {
        toast.error('Creator not found');
        router.push('/creators');
      }
    } catch (error) {
      console.error('Error fetching creator details:', error);
      toast.error('Error loading creator details');
      router.push('/creators');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">Loading creator details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] p-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-500">Creator not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFC] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-500 hover:text-blue-600 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Creator Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              {model.display_picture_url ? (
                <Image
                  src={model.display_picture_url}
                  alt={model.name}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Creator Info */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{model.name}</h1>
              {model.is_verified && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-gray-600 text-lg mb-4">@{model.username}</p>
            <p className="text-gray-500">{model.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{model.fan_count.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Fans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">${model.price || 0}</div>
              <div className="text-sm text-gray-600">Price</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{model.subscription_type}</div>
              <div className="text-sm text-gray-600">Subscription</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{model.language || 'N/A'}</div>
              <div className="text-sm text-gray-600">Language</div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  model.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {model.status}
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timezone:</span>
              <span className="font-semibold">{model.timezone || 'N/A'}</span>
            </div>
            {model.verification_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Verified On:</span>
                <span className="font-semibold">
                  {new Date(model.verification_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="flex gap-4 justify-center">
            {model.onlyfans_link && (
              <a
                href={model.onlyfans_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M19 4a1 1 0 01-1 1h-.5l-.5 7a1 1 0 11-2 0l-.5-7H4.5l-.5 7a1 1 0 11-2 0l-.5-7H1a1 1 0 010-2h18a1 1 0 011 1z" clipRule="evenodd" />
                </svg>
                Visit OnlyFans
              </a>
            )}
            {model.telegram_link && (
              <a
                href={model.telegram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.5 10a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" />
                </svg>
                Contact on Telegram
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
