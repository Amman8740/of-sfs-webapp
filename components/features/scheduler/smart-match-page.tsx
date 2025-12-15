"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ExpandIcon, ThreeDotsIcon } from '@/components/ui/icons';
import { useUserProfile } from '@/lib/utils/swr';
import { BlueSpinner } from '@/components/ui/spinners';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { CreatorDetailsModal } from './creator-details-modal';
import { MediaDetailsModal } from './media-details-modal';

interface SmartMatchEntry {
  id: string;
  user_id?: string;
  username?: string;
  display_name?: string;
  profile_pic_url?: string;
  fans?: number;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  match_score: number;
  compatibility: string;
  fan_difference: number;
  selected?: boolean;
  status?: 'pending' | 'sent' | 'idle';
  already_requested?: boolean;
  request_status?: 'pending' | null;
  // Agency mode properties
  model1_id?: string;
  model1_name?: string;
  model1_fans?: number;
  model1_verified?: boolean;
  model1_pic?: string;
  model2_id?: string;
  model2_name?: string;
  model2_fans?: number;
  model2_verified?: boolean;
  model2_pic?: string;
  badge?: string;
  description?: string;
  direction?: string;
  match_type?: 'internal' | 'linked_agency' | 'external';
}

interface SmartMatchPageProps {
  modelId?: string;
  userType?: 'agency' | 'creator';
}

export const SmartMatchPage: React.FC<SmartMatchPageProps> = ({ modelId, userType = 'agency' }) => {
  const { userData, user } = useUserProfile(); // For creators, get their model ID
  const [entries, setEntries] = useState<SmartMatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentDetails, setCurrentDetails] = useState<any>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaDetails, setMediaDetails] = useState<any>(null);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [filterInfo, setFilterInfo] = useState<any>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [creatorSettings, setCreatorSettings] = useState<{ [key: string]: any }>({});

  // For creators, use their own user ID from auth; for agency, use the provided modelId
  const effectiveModelId = userType === 'creator' ? user?.id : modelId;

  // Get next available day based on SFS settings
  const getNextAvailableDate = (creatorUserId: string): { isoDate: string; displayDate: string } => {
    const settings = creatorSettings[creatorUserId];
    const availableDays = settings?.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Start from tomorrow (next day from today)
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + 1);
    
    // Loop until we find an available day (max 7 days)
    for (let i = 0; i < 7; i++) {
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (availableDays.includes(dayName)) {
        return {
          isoDate: checkDate.toISOString(),
          displayDate: checkDate.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        };
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
    
    // Fallback to next day if no available day found
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    return {
      isoDate: nextDay.toISOString(),
      displayDate: nextDay.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };
  };

  // Fetch SFS settings for a specific creator
  const fetchCreatorSettings = async (creatorUserId: string) => {
    try {
      const response = await fetch(`/api/sfs-settings?user_id=${creatorUserId}`);
      if (response.ok) {
        const data = await response.json();
        setCreatorSettings(prev => ({
          ...prev,
          [creatorUserId]: data.data
        }));
      }
    } catch (err) {
      console.error('Failed to fetch settings for creator:', creatorUserId, err);
      // Continue with defaults if fetch fails
    }
  };

  useEffect(() => {
    if (effectiveModelId) {
      fetchSmartMatches();
    }
  }, [effectiveModelId]);

  const fetchSmartMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching smart matches:', { userType, effectiveModelId, userId: user?.id });
      
      // For agencies, use the agency-matches endpoint; for creators, use regular endpoint
      const url = userType === 'agency' 
        ? `/api/smart-match/agency-matches`
        : `/api/smart-match?model_id=${effectiveModelId}&limit=20`;
      
      console.log('📡 Calling endpoint:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', { status: response.status, error: errorData });
        const errorMsg = errorData.details || errorData.error || `Failed to fetch smart matches (${response.status})`;
        throw new Error(errorMsg);
      }
      
      const result = await response.json();
      console.log('✅ Smart matches loaded:', { count: result.count, data_length: result.data?.length });
      
      const newEntries = result.data || [];
      setEntries(newEntries);
      setFilterInfo(result.filter);
      
      // Fetch settings for each creator (only for creator mode)
      if (userType === 'creator') {
        for (const entry of newEntries) {
          fetchCreatorSettings(entry.user_id);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('🚨 Error in fetchSmartMatches:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (receiverUserId: string) => {
    if (!effectiveModelId) {
      toast.error('User information not loaded. Please try again.');
      return;
    }

    try {
      setSendingRequest(receiverUserId);

      const entry = entries.find(e => e.user_id === receiverUserId);
      const scheduledDateInfo = getNextAvailableDate(receiverUserId);
      
      const response = await fetch('/api/smart-match/send-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_model_id: effectiveModelId,
          receiver_only_profile_id: receiverUserId,
          // Include match data from the selected entry
          ...(entry && {
            requester_username: entry.username,
            requester_fan_count: entry.fans,
            requester_media_url: entry.profile_pic_url,
            compatibility_score: entry.match_score,
            match_score: entry.match_score,
            compatibility: entry.compatibility,
            content_slot: 1,
            scheduled_date: scheduledDateInfo.isoDate
          })
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.error || `Failed to send request (${response.status})`);
      }

      // Update the status of the entry to 'sent' instead of removing it
      setEntries(prev => prev.map(entry => 
        entry.user_id === receiverUserId 
          ? { ...entry, status: 'sent' }
          : entry
      ));
      
      // Show success notification
      toast.success('SFS request sent successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send request';
      toast.error(errorMessage);
    } finally {
      setSendingRequest(null);
    }
  };

  // Handle sending request between agency models
  const handleSendAgencyRequest = async (senderModelId: string, receiverModelId: string, senderName: string, receiverName: string) => {
    try {
      const requestId = `${senderModelId}-${receiverModelId}`;
      setSendingRequest(requestId);

      console.log(`📤 Sending SFS request from ${senderName} (${senderModelId}) to ${receiverName} (${receiverModelId})`);

      // Get the match entry to get complete data
      const matchEntry = entries.find(e => e.model1_id === senderModelId && e.model2_id === receiverModelId);
      
      if (!matchEntry) {
        throw new Error('Match entry not found');
      }

      // For agency-to-agency requests via Smart Match:
      // sender_id = sender model ID (Model 1)
      // receiver_id = receiver model ID (Model 2)
      // Additional metadata for smart match tracking
      const response = await fetch('/api/sfs-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: senderModelId,  // Sender model ID
          receiver_id: receiverModelId,  // Receiver model ID
          sender_name: senderName,  // Sender model name
          receiver_name: receiverName,  // Receiver model name
          sender_fans: matchEntry.model1_fans || 0,  // Sender's fan count
          receiver_fans: matchEntry.model2_fans || 0,  // Receiver's fan count
          compatibility_score: matchEntry.match_score || 0,  // Match score
          match_score: String(matchEntry.match_score || 0),  // Match score as string
          match_reasons: matchEntry.compatibility,  // Compatibility text
          status: 'pending'  // Default status
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Send request failed:', errorData);
        throw new Error(errorData.error || errorData.details || `Failed to send request`);
      }

      const responseData = await response.json();
      console.log('Request sent successfully:', responseData);

      // Show success notification with more details
      toast.success(` Request sent! ${senderName} → ${receiverName} (Score: ${matchEntry.match_score}%)`);
      
      // Update entry status
      setEntries(prev => prev.map(entry => 
        (entry.model1_id === senderModelId && entry.model2_id === receiverModelId)
          ? { ...entry, status: 'sent', already_requested: true }
          : entry
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send request';
      console.error('❌ Error:', errorMessage);
      toast.error(`${errorMessage}`);
    } finally {
      setSendingRequest(null);
    }
  };

  const handleViewDetails = (modelName: string, fans: number, matchScore: number, compatibility: string) => {
    setCurrentDetails({
      username: modelName,
      creator_name: modelName,
      fans: fans,
      content_slots_available: 0,
      sfs_availability_time: 'N/A',
      compatibility: compatibility,
      match_score: matchScore,
      rules: {
        maxSfsPerDay: 1,
        contentAllowed: ['Fully Explicit'],
        pinContent: 'N/A'
      }
    });
    setDetailsOpen(true);
  };

  const handleDetails = (entry: SmartMatchEntry) => {
    setCurrentDetails({
      username: entry.username,
      creator_name: entry.display_name,
      fans: entry.fans,
      content_slots_available: 0,
      sfs_availability_time: 'N/A',
      compatibility: entry.compatibility,
      match_score: entry.match_score
    });
    setDetailsOpen(true);
  };

  const handleImageClick = (imageUrl: string, creatorName: string) => {
    setSelectedImage(imageUrl);
    setSelectedImageName(creatorName);
    setImageModalOpen(true);
  };

  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="p-3 text-2xl font-bold text-gray-900">Smart Matches</h1>
          {/* <button
            onClick={handleScheduleNew}
            className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-[#0091FF]"
            style={{ backgroundColor: '#0091FF' }}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Refresh
          </button> */}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 border-l-4 border-red-500 rounded-lg bg-red-50">
          <p className="text-sm font-medium text-red-900">❌ Error: {error}</p>
          <p className="mt-1 text-xs text-red-700">
            Please check the browser console for more details. This might be due to:
            <ul className="mt-2 ml-4 list-disc">
              <li>User profile not set as agency</li>
              <li>No models associated with your agency</li>
              <li>Permission issues with the account</li>
            </ul>
          </p>
          <button
            onClick={() => fetchSmartMatches()}
            className="px-4 py-2 mt-3 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State with Skeleton Loaders */}
      {loading && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Media
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Creator
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Fan Count
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Content Slot
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Match Score
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(8)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-20 h-3 bg-gray-100 rounded"></div>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="w-12 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="w-8 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="h-8 bg-gray-200 rounded-lg w-14"></div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && !error && (
        <div className="p-6 border-l-4 border-blue-500 rounded-lg bg-blue-50">
          <div className="max-w-4xl">
            <p className="mb-4 text-lg font-semibold text-blue-900">📋 How to Extract Creator Data</p>
            
            {/* Step 1 */}
            <div className="p-4 mb-6 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-bold text-white bg-blue-600 rounded-full">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Install Browser Extension</h3>
                  <p className="mt-1 text-sm text-gray-600">Download and install the OnlyFans Data Extractor extension from your browser's extension store (Chrome Web Store, Firefox Add-ons, etc.)</p>
                  <div className="p-2 mt-2 text-xs text-gray-700 bg-gray-100 rounded">
                    <p className="font-mono">Extension Name: OnlyFans Profile Extractor</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 mb-6 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-bold text-white bg-blue-600 rounded-full">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Open OnlyFans Website</h3>
                  <p className="mt-1 text-sm text-gray-600">Navigate to <span className="px-2 py-1 font-mono bg-gray-100 rounded">onlyfans.com</span> and log in to your account</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 mb-6 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-bold text-white bg-blue-600 rounded-full">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Browse Creator Profiles</h3>
                  <p className="mt-1 text-sm text-gray-600">Search for creators or browse through the explore section to find profiles you want to extract data from</p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 mb-6 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-bold text-white bg-blue-600 rounded-full">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Extract Profile Data</h3>
                  <p className="mt-1 text-sm text-gray-600">Click the extension icon in your browser toolbar and select "Extract Profile" to gather creator information including:</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-700">
                    <div className="p-2 rounded bg-gray-50">✓ Username & Display Name</div>
                    <div className="p-2 rounded bg-gray-50">✓ Fan Count</div>
                    <div className="p-2 rounded bg-gray-50">✓ Profile Picture</div>
                    <div className="p-2 rounded bg-gray-50">✓ Bio & Description</div>
                    <div className="p-2 rounded bg-gray-50">✓ Verification Status</div>
                    <div className="p-2 rounded bg-gray-50">✓ Post Count</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 mb-6 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-bold text-white bg-blue-600 rounded-full">5</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Import Data to System</h3>
                  <p className="mt-1 text-sm text-gray-600">The extracted data will be automatically formatted and can be imported into your dashboard for smart matching and collaboration</p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
              <p className="mb-2 font-semibold text-amber-900">⚠️ Important Notes:</p>
              <ul className="space-y-1 text-sm text-amber-800">
                <li>• Make sure you have permission to extract profile data</li>
                <li>• Data will be used only for collaboration matching</li>
                <li>• Keep the extracted information confidential</li>
                <li>• Bulk extraction may take a few minutes depending on profile size</li>
              </ul>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <button
                onClick={() => fetchSmartMatches()}
                className="px-6 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                ↻ Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && !error && (
        <div className="p-6 border-l-4 border-yellow-400 rounded-lg bg-yellow-50">
          <p className="mb-3 text-sm font-semibold text-yellow-900">
            No Smart Matches Found
          </p>
          <div className="mb-4 space-y-2 text-sm text-yellow-800">
            <p>There are no profiles in the database to match with.</p>
            <div className="p-3 mt-3 font-mono text-xs bg-yellow-100 rounded">
              <p className="mb-2 font-bold">Your Profile:</p>
              <p>• Your Fans: {filterInfo?.your_fans || 'N/A'}</p>
              <p className="mt-2 font-bold">Solutions:</p>
              <p>1. Make sure profiles exist in the onlyfans_profiles table</p>
              <p>2. Profiles cannot be your own (user_id != yours)</p>
              <p>3. Add more profiles to the database</p>
            </div>
          </div>
          <button
            onClick={() => fetchSmartMatches()}
            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-yellow-600 rounded hover:bg-yellow-700"
          >
            Retry Search
          </button>
        </div>
      )}

      {/* Matches Table */}
      {!loading && entries.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {userType === 'agency' ? (
                    <>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Model 1
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Fans
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Model 2
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Fans
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Match Score
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Compatibility
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Actions
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Media
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Fan Count
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Content Slot
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Match Score
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Actions
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  userType === 'agency' ? (
                    // Agency mode: showing model pairs
                    <tr key={entry.id} className="transition-colors hover:bg-gray-50">
                      {/* Model 1 */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-200 rounded-lg">
                            {entry.model1_pic ? (
                              <img
                                src={entry.model1_pic}
                                alt={entry.model1_name}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <svg className="w-6 h-6 m-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{entry.model1_name}</p>
                              {entry.match_type === 'linked_agency' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                  Agency Partner
                                </span>
                              )}
                            </div>
                            {entry.model1_verified && (
                              <span className="text-xs text-blue-600">✓ Verified</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Model 1 Fans */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{entry.model1_fans}</span>
                      </td>

                      {/* Model 2 */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-200 rounded-lg">
                            {entry.model2_pic ? (
                              <img
                                src={entry.model2_pic}
                                alt={entry.model2_name}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <svg className="w-6 h-6 m-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{entry.model2_name}</p>
                              {entry.match_type === 'linked_agency' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                  Agency Partner
                                </span>
                              )}
                            </div>
                            {entry.model2_verified && (
                              <span className="text-xs text-blue-600">✓ Verified</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Model 2 Fans */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{entry.model2_fans}</span>
                      </td>

                      {/* Match Score */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className={`inline-flex items-center justify-center w-14 h-8 rounded-lg font-bold text-sm ${
                          entry.match_score >= 90 ? 'bg-green-100 text-green-700' :
                          entry.match_score >= 75 ? 'bg-blue-100 text-blue-700' :
                          entry.match_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {entry.match_score}%
                        </div>
                      </td>

                      {/* Compatibility */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{entry.compatibility}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        {entry.already_requested && entry.status === 'pending' ? (
                          <span className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-amber-700 bg-amber-100">
                            ⏳ Already Sent
                          </span>
                        ) : entry.status === 'sent' ? (
                          <span className="inline-flex items-center px-3 py-2 text-xs font-medium text-green-700 bg-green-100 rounded-lg">
                            ✓ Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendAgencyRequest(entry.model1_id!, entry.model2_id!, entry.model1_name || 'Model 1', entry.model2_name || 'Model 2')}
                            disabled={sendingRequest === `${entry.model1_id}-${entry.model2_id}`}
                            className="inline-flex items-center px-3 py-2 text-xs font-medium text-green-600 transition-colors border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={`Send ${entry.model1_name} → ${entry.model2_name}`}
                          >
                            {sendingRequest === `${entry.model1_id}-${entry.model2_id}` ? 'Sending...' : 'Send Request'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    // Creator mode: showing single creator matches
                    <tr key={entry.id} className="transition-colors hover:bg-gray-50">
                      {/* Media/Image */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <button
                          onClick={() => entry.profile_pic_url && handleImageClick(entry.profile_pic_url, entry.display_name || entry.username || '')}
                          className="flex-shrink-0 transition-opacity cursor-pointer hover:opacity-80"
                        >
                          <div className="relative flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-200 rounded-lg">
                            {entry.profile_pic_url ? (
                              <img
                                src={entry.profile_pic_url}
                                alt={entry.display_name || entry.username}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </button>
                      </td>

                      {/* Creator Info */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {entry.display_name || entry.username}
                          </p>
                          <p className="text-xs text-gray-500">@{entry.username}</p>
                        </div>
                      </td>

                      {/* Fan Count */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{entry.fans}</span>
                      </td>

                      {/* Date - using SFS settings or default to next day */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {entry.user_id ? getNextAvailableDate(entry.user_id).displayDate : 'N/A'}
                        </span>
                      </td>

                      {/* Content Slot - show 1 */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900">1</span>
                      </td>

                      {/* Match Score */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className={`inline-flex items-center justify-center w-14 h-8 rounded-lg font-bold text-sm ${
                          entry.match_score === 100 ? 'bg-green-100 text-green-700' :
                          entry.match_score >= 95 ? 'bg-green-100 text-green-700' :
                          entry.match_score >= 85 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {entry.match_score}%
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        {entry.already_requested && entry.request_status === 'pending' ? (
                          <span className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-amber-700 bg-amber-100">
                            ⏳ Already Sent
                          </span>
                        ) : entry.status === 'sent' ? (
                          <span className="inline-flex items-center px-3 py-2 text-xs font-medium text-green-700 bg-green-100 rounded-lg">
                            ✓ Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => entry.user_id && handleSendRequest(entry.user_id)}
                            disabled={sendingRequest === entry.user_id}
                            className="inline-flex items-center px-3 py-2 text-xs font-medium text-green-600 transition-colors border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingRequest === entry.user_id ? 'Sending...' : 'Send Request'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Creator Details Modal */}
      <CreatorDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        details={currentDetails}
      />

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setImageModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute z-10 p-2 text-white transition-colors bg-gray-600 rounded top-4 right-4 hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Image Container */}
            <div className="flex items-center justify-center p-6 bg-gray-100">
              <img
                src={selectedImage}
                alt={selectedImageName || 'Profile'}
                className="object-contain max-w-full rounded max-h-80"
              />
            </div>
            {/* Creator Name Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-200 rounded-b-lg">
              <p className="text-sm font-medium text-gray-900">{selectedImageName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Media Details Modal */}
      <MediaDetailsModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        details={mediaDetails}
      />
    </div>
  );
};
