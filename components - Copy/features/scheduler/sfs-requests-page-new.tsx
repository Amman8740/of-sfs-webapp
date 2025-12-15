"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PrimaryButton } from '@/components/ui/button';
import { ExpandIcon, ThreeDotsIcon, SFSFilterIcon } from '@/components/ui/icons';
import { BlueSpinner } from '@/components/ui/spinners';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import smartMatchData from '../../../fixtures/smart-match-data.json';
import { CreatorDetailsModal } from './creator-details-modal';
import { MediaDetailsModal } from './media-details-modal';
import { SFSSettingsModal } from './sfs-settings-modal';

interface SFSRequestsEntry {
  id: string;
  media: {
    thumbnail: string;
    selected: boolean;
  };
  creator: string;
  fanCount: number;
  tags: string[];
  date: string;
  time: string;
  contentSlot: number;
  status: 'Approved' | 'Waiting' | 'Denied' | 'Completed';
  actions: string[];
  requestId?: string;
  otherPartyId?: string;
  matchScore?: number;
  compatibilityScore?: number;
}

interface SFSRequestsPageProps {
  data?: SFSRequestsEntry[];
  mutateData?: () => void;
  modelId?: string;
}

// Cache for SFS requests
let requestsCache: { [key: string]: SFSRequestsEntry[] } = {};
let cacheTimes: { [key: string]: number } = {};
const CACHE_DURATION = 60 * 1000; // 1 minute

export const SFSRequestsPageNew: React.FC<SFSRequestsPageProps> = ({ modelId }) => {
  const [entries, setEntries] = useState<SFSRequestsEntry[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentDetails, setCurrentDetails] = useState<any>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaDetails, setMediaDetails] = useState<any>(null);
  const [activeToggle, setActiveToggle] = useState<'sent' | 'received'>('sent');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load SFS requests when component mounts or toggle changes
  useEffect(() => {
    loadSFSRequests(activeToggle);
  }, [activeToggle]);

  const loadSFSRequests = async (type: 'sent' | 'received') => {
    try {
      // Check cache first
      const cacheKey = `sfs-${type}`;
      const now = Date.now();
      if (requestsCache[cacheKey] && (now - (cacheTimes[cacheKey] || 0)) < CACHE_DURATION) {
        console.log(`⚡ Using cached ${type} requests`);
        setEntries(requestsCache[cacheKey]);
        return;
      }

      setLoading(true);
      console.log(`🔄 Fetching ${type} requests from API...`);
      
      const response = await fetch(`/api/sfs-requests?type=${type}`, {
        signal: AbortSignal.timeout(20000)
      });

      console.log(`📊 API Response status:`, response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.details || errorData.error || `HTTP ${response.status}`;
        console.error(`❌ API Error:`, errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log(`📦 API Response:`, data);
      
      if (data.success && data.data) {
        const transformedData = data.data;
        setEntries(transformedData);
        
        // Cache the data
        requestsCache[cacheKey] = transformedData;
        cacheTimes[cacheKey] = now;
        
        console.log(`✅ Loaded ${transformedData.length} ${type} SFS requests`);
      } else {
        console.warn(`⚠️ Unexpected API response format:`, data);
        setEntries([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⏱️ Request timeout');
        toast.error('Request timeout. Showing cached data if available.');
        // Fallback to cached data if available
        const cacheKey = `sfs-${type}`;
        if (requestsCache[cacheKey]) {
          setEntries(requestsCache[cacheKey]);
        } else {
          setEntries([]);
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error loading ${type} requests:`, error);
        toast.error(`Failed to load ${type} requests: ${errorMessage}`);
        setEntries([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleNew = () => {
    console.log('Schedule New SFS clicked');
  };

  const handleFilterClick = () => {
    setSettingsOpen(true);
  };

  const handleSettingsSave = (data: any) => {
    // Reload the SFS requests list to show new record
    loadSFSRequests(activeToggle);
    setSettingsOpen(false);
    toast.success('SFS request created successfully!');
  };

  const handleAction = async (id: string, action: string) => {
    console.log(`Action ${action} for entry ${id}`);
    
    if (action === 'approve') {
      try {
        console.log(`📤 Approving request: ${id}`);
        
        const payload = { requestId: id, status: 'approved' };
        console.log(`📨 Sending PATCH payload:`, payload);
        
        const response = await fetch('/api/sfs-requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        console.log(`📥 PATCH response status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`❌ PATCH error response:`, errorData);
          throw new Error(errorData.details || errorData.error || 'Failed to approve request');
        }
        
        const data = await response.json();
        console.log('✅ Request approved:', data);
        
        // Update local state with new status
        setEntries(prev => prev.map(entry => 
          entry.id === id 
            ? { ...entry, status: 'Approved' }
            : entry
        ));
        toast.success('Request approved successfully!');
        
        // Invalidate cache
        requestsCache[`sfs-${activeToggle}`] = [];
        cacheTimes[`sfs-${activeToggle}`] = 0;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error approving request:', errorMsg);
        toast.error(`Failed to approve request: ${errorMsg}`);
      }
    } else if (action === 'decline') {
      try {
        console.log(`📤 Declining request: ${id}`);
        
        const payload = { requestId: id, status: 'declined' };
        console.log(`📨 Sending PATCH payload:`, payload);
        
        const response = await fetch('/api/sfs-requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        console.log(`📥 PATCH response status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`❌ PATCH error response:`, errorData);
          throw new Error(errorData.details || errorData.error || 'Failed to decline request');
        }
        
        const data = await response.json();
        console.log('✅ Request declined:', data);
        
        // Update local state with new status
        setEntries(prev => prev.map(entry => 
          entry.id === id 
            ? { ...entry, status: 'Denied' }
            : entry
        ));
        toast.success('Request declined successfully!');
        
        // Invalidate cache
        requestsCache[`sfs-${activeToggle}`] = [];
        cacheTimes[`sfs-${activeToggle}`] = 0;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error declining request:', errorMsg);
        toast.error(`Failed to decline request: ${errorMsg}`);
      }
    } else if (action === 'details') {
      const entry = entries.find(e => e.id === id);
      if (entry) {
        setCurrentDetails({
          model: entry.creator.replace('@',''),
          promoName: 'SFS Request',
          fans: entry.fanCount,
          matchCompatibility: 'Average',
          rules: {
            maxSfsPerDay: 3,
            contentAllowed: ['Fully Explicit', 'Topless', 'SFW Only'],
            pinContent: 'Accept All',
          },
        });
        setDetailsOpen(true);
      }
    }
  };

  const handleDetails = (id: string) => {
    handleAction(id, 'details');
  };

  const handleMediaExpand = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setMediaDetails({
        imageUrl: entry.media.thumbnail,
        creatorName: entry.creator,
        // Keep these for backward compatibility if needed
        date: `${entry.date}`,
        category: [],
        hashtags: [],
        caption: '',
        notes: '',
      });
      setMediaOpen(true);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    
    switch (status) {
      case 'Approved':
      case 'Completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Waiting':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'Denied':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleMediaSelect = (id: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, media: { ...entry.media, selected: !entry.media.selected } }
        : entry
    ));
  };

  const handleSelectAll = () => {
    const allSelected = entries.every(entry => entry.media.selected);
    setEntries(prev => prev.map(entry => ({
      ...entry,
      media: { ...entry.media, selected: !allSelected }
    })));
  };

  return (
    <div className="space-y-2 bg-white">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">SFS Requests</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-end w-full gap-3 py-4">
           <button
            onClick={handleFilterClick}
            className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-[#0091FF]"
          >
            <SFSFilterIcon className="w-3 h-3" />
          
          </button>
          <div className="flex items-center gap-6">
            <div className="inline-flex p-1 bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => setActiveToggle('sent')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeToggle === 'sent'
                    ? 'text-white'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                style={activeToggle === 'sent' ? { backgroundColor: '#0091FF' } : {}}
              >
                Sent
              </button>
              <button
                onClick={() => setActiveToggle('received')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeToggle === 'received'
                    ? 'text-white'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                style={activeToggle === 'received' ? { backgroundColor: '#0091FF' } : {}}
              >
                Received
              </button>
            </div>
          </div>
         
        </div>
          </div>
        </div>
      </div>

      {/* Table Container with Header */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white border border-gray-200 rounded-lg shadow">
        {/* Sub-header with SFS Requests */}
        {/* <div className="flex items-center justify-end w-full gap-3 p-4 border-b border-gray-200">
           <button
            onClick={handleFilterClick}
            className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-[#0091FF]"
          >
            <SFSFilterIcon className="w-3 h-3" />
          
          </button>
          <div className="flex items-center gap-6">
            <div className="inline-flex p-1 bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => setActiveToggle('sent')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeToggle === 'sent'
                    ? 'text-white'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                style={activeToggle === 'sent' ? { backgroundColor: '#0091FF' } : {}}
              >
                Sent
              </button>
              <button
                onClick={() => setActiveToggle('received')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeToggle === 'received'
                    ? 'text-white'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                style={activeToggle === 'received' ? { backgroundColor: '#0091FF' } : {}}
              >
                Received
              </button>
            </div>
          </div>
         
        </div> */}
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
              
                  <th className="w-20 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Media
                  </th>
                  <th className="w-32 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Creator
                  </th>
                  <th className="w-24 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Fan Count
                  </th>
                  <th className="w-40 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Match Score
                  </th>
                  <th className="w-48 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="w-24 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Content Slot
                  </th>
                  <th className="w-48 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <>
                    {[...Array(6)].map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="w-20 px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        </td>
                        <td className="w-32 px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            <div className="h-3 w-20 bg-gray-100 rounded"></div>
                          </div>
                        </td>
                        <td className="w-24 px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-12 bg-gray-200 rounded"></div>
                        </td>
                        <td className="w-40 px-6 py-4 whitespace-nowrap">
                          <div className="h-8 w-14 bg-gray-200 rounded-lg"></div>
                        </td>
                        <td className="w-48 px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-28 bg-gray-200 rounded"></div>
                        </td>
                        <td className="w-24 px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-8 bg-gray-200 rounded"></div>
                        </td>
                        <td className="w-48 px-6 py-4 whitespace-nowrap">
                          <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12">
                      <div className="flex items-center justify-center">
                        <p className="text-sm text-gray-500">No {activeToggle} SFS requests yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">

                    {/* Media Column */}
                    <td className="w-20 px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative w-12 h-12 overflow-hidden bg-gray-200 rounded-lg">
                          {entry.media.thumbnail.startsWith('http') ? (
                            <img
                              src={entry.media.thumbnail}
                              alt="Media thumbnail"
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Image
                              src={entry.media.thumbnail}
                              alt="Media thumbnail"
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          )}
                          <button
                            onClick={() => handleMediaExpand(entry.id)}
                            className="absolute p-1 transition-colors bg-white rounded-full shadow-sm bottom-1 right-1 hover:bg-gray-50"
                          >
                            <ExpandIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Creator Column */}
                    <td className="w-32 px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {entry.creator}
                    </td>

                    {/* Fan Count Column */}
                    <td className="w-24 px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {entry.fanCount.toLocaleString()}
                    </td>

                    {/* Match Score Column */}
                   <td className="px-6 py-3 whitespace-nowrap">
                    <div
  className={`inline-flex items-center justify-center w-14 h-8 rounded-lg font-bold text-sm ${
    (entry.matchScore ?? 0) === 100 ? 'bg-green-100 text-green-700' :
    (entry.matchScore ?? 0) >= 95 ? 'bg-green-100 text-green-700' :
    (entry.matchScore ?? 0) >= 85 ? 'bg-yellow-100 text-yellow-700' :
    'bg-orange-100 text-orange-700'
  }`}
>
  {entry.matchScore ?? 0}%
</div>

                    </td>

                    {/* Date Column */}
                    <td className="w-48 px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{entry.date}</div>
                        <div className="text-gray-500">({entry.time})</div>
                      </div>
                    </td>

                    {/* Content Slot Column */}
                    <td className="w-24 px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {entry.contentSlot}
                    </td>

                    {/* Status Column */}
                    <td className="w-48 px-6 py-4 text-sm font-medium text-left whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <span className={getStatusBadge(entry.status)}>
                          {entry.status}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 text-gray-400 transition-colors hover:text-gray-600">
                            <ThreeDotsIcon className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => handleDetails(entry.id)}>
                              View Details
                            </DropdownMenuItem>
                            {activeToggle === 'received' && (
                              <>
                                <DropdownMenuSeparator />
                                {entry.status === 'Waiting' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleAction(entry.id, 'approve')} className="text-green-600">
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction(entry.id, 'decline')} className="text-red-600">
                                      Decline
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Creator Details Modal */}
      <CreatorDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        details={currentDetails}
      />

      <MediaDetailsModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        details={mediaDetails}
      />

      <SFSSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSettingsSave}
      />
    </div>
  );
};
