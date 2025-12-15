"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PrimaryButton } from '@/components/ui/button';
import { DeleteIcon, WarningIcon, ListIcon, CalendarIcon, PlusIcon, ThreeDotsIcon } from '@/components/ui/icons';
import { CalendarView } from './calendar-view';
import { ScheduleNewSFSModal } from './schedule-new-sfs-modal';
import { BlueSpinner } from '@/components/ui/spinners';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import scheduledSFSData from '../../../fixtures/scheduled-sfs-data.json';

interface ScheduledSFSEntry {
  id: string;
  media: {
    thumbnail: string;
  };
  date: string;
  time: string;
  creator: string;
  contentSlot: number;
  promoLink: string;
  status: 'Done' | 'Scheduled' | 'Cancelled' | 'Flagged' | 'Pending' | 'Approved' | 'Rejected' | 'pending' | 'approved' | 'rejected';
  actions: string[];
}

interface ScheduledSFSPageProps {
  data?: ScheduledSFSEntry[];
  mutateData?: () => void;
}

export const ScheduledSFSPage: React.FC<ScheduledSFSPageProps> = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [entries, setEntries] = useState<ScheduledSFSEntry[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeToggle, setActiveToggle] = useState<'sent' | 'received'>('sent');
  const [loading, setLoading] = useState(false);

  // Load scheduled SFS when component mounts or toggle changes
  useEffect(() => {
    loadScheduledSFS(activeToggle);
  }, [activeToggle]);

  const loadScheduledSFS = async (type: 'sent' | 'received') => {
    try {
      setLoading(true);
      console.log('📡 Fetching scheduled SFS:', { type });
      
      // Determine which endpoint to use based on role
      // For agencies, use the dedicated agency-history endpoint
      // For creators, use the standard endpoint
      const endpoint = '/api/scheduled-sfs?type=' + type;
      
      console.log('🔗 Using endpoint:', endpoint);
      const response = await fetch(endpoint);
      
      console.log('📦 Response status:', response.status, response.ok);
      
      if (!response.ok) {
        console.error('❌ API error:', response.statusText);
        const errorData = await response.json();
        console.error('❌ Error details:', errorData);
        setEntries([]);
        return;
      }
      
      const data = await response.json();
      console.log('📨 API Response Data:', { success: data.success, count: data.data?.length || 0, data });
      
      if (data.success && Array.isArray(data.data)) {
        // Transform API data to UI format
        const transformedEntries = (data.data || []).map((sfs: any) => ({
          id: sfs.id,
          media: {
            thumbnail: sfs.media?.thumbnail_url || sfs.media?.file_url || '/placeholder.jpg'
          },
          date: new Date(sfs.scheduled_date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          time: sfs.scheduled_time || 'TBD',
          creator: sfs.partner_creator || 'Unknown',
          contentSlot: sfs.content_slot || 1,
          promoLink: sfs.promo_links?.url || sfs.promo_link || '#',
          status: sfs.status ? sfs.status.charAt(0).toUpperCase() + sfs.status.slice(1) : 'Pending',
          actions: type === 'received' && sfs.status === 'pending' ? ['approve', 'decline'] : []
        }));
        console.log('✅ Transformed entries:', { count: transformedEntries.length, entries: transformedEntries });
        setEntries(transformedEntries);
      } else {
        console.log('⚠️ No data or not success:', { success: data.success, isArray: Array.isArray(data.data) });
        setEntries([]);
      }
    } catch (error) {
      console.error('Error loading scheduled SFS:', error);
      toast.error('Failed to load scheduled SFS');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleNew = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleSuccess = () => {
    // Close modal and reload data after successful creation
    setShowScheduleModal(false);
    toast.success('Scheduled SFS created successfully');
    // Small delay to ensure data is persisted before fetching
    setTimeout(() => {
      loadScheduledSFS(activeToggle);
    }, 500);
  };

  const handleViewModeChange = (mode: 'list' | 'calendar') => {
    setViewMode(mode);
  };

  const handleAction = (id: string, action: string) => {
    if (action === 'approve') {
      handleApproveScheduledSFS(id);
    } else if (action === 'decline') {
      handleDeclineScheduledSFS(id);
    } else if (action === 'delete') {
      handleDeleteScheduledSFS(id);
    }
  };

  const handleApproveScheduledSFS = async (id: string) => {
    try {
      const response = await fetch(`/api/scheduled-sfs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) throw new Error('Failed to approve scheduled SFS');
      
      // Reload data to show updated status
      loadScheduledSFS(activeToggle);
      toast.success('Scheduled SFS approved');
    } catch (error) {
      console.error('Error approving scheduled SFS:', error);
      toast.error('Failed to approve scheduled SFS');
    }
  };

  const handleDeclineScheduledSFS = async (id: string) => {
    try {
      const response = await fetch(`/api/scheduled-sfs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (!response.ok) throw new Error('Failed to decline scheduled SFS');
      
      // Reload data to show updated status
      loadScheduledSFS(activeToggle);
      toast.success('Scheduled SFS declined');
    } catch (error) {
      console.error('Error declining scheduled SFS:', error);
      toast.error('Failed to decline scheduled SFS');
    }
  };

  const handleDeleteScheduledSFS = async (id: string) => {
    try {
      const response = await fetch(`/api/scheduled-sfs/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete scheduled SFS');
      
      // Update local state and remove from list
      setEntries(prev => prev.filter(entry => entry.id !== id));
      toast.success('Scheduled SFS deleted');
    } catch (error) {
      console.error('Error deleting scheduled SFS:', error);
      toast.error('Failed to delete scheduled SFS');
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'Done':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Scheduled':
        return `${baseClasses} bg-app-blue-light text-app-blue`;
      case 'Cancelled':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'Rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Flagged':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="pb-12 space-y-4">
  
      {/* Table Container with Header */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white border border-gray-200 rounded-lg shadow">
        {/* Sub-header with Scheduled SFS and Toggle */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Scheduled SFS</h2>
           <div className='flex gap-5'> 
             {/* Sent/Received Toggle */}
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
            {/* View Toggle Buttons */}
            <div className="flex items-center p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-md transition-all duration-200 ease-in-out ${
                  viewMode === 'list' 
                    ? 'bg-app-blue text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewModeChange('calendar')}
                className={`p-2 rounded-md transition-all duration-200 ease-in-out ${
                  viewMode === 'calendar' 
                    ? 'bg-app-blue text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
            </div>
           </div>
          </div>
        </div>
        
        {/* Content based on view mode */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            viewMode === 'list' ? (
              <div className="w-full overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="sticky top-0 z-10 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                          Media
                        </th>
                        <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                          Creator
                        </th>
                        <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                          Slot
                        </th>
                        <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                          Promo Link
                        </th>
                        <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-sm font-medium tracking-wider text-center text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...Array(6)].map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="w-12 h-12 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="w-24 h-4 bg-gray-200 rounded"></div>
                              <div className="w-16 h-3 bg-gray-100 rounded"></div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="w-32 h-4 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="w-8 h-4 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="w-40 h-4 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="w-5 h-4 mx-auto bg-gray-200 rounded"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <BlueSpinner size="large" />
                <p className="text-sm text-gray-600">Loading calendar...</p>
              </div>
            )
          ) : viewMode === 'list' ? (
            <div className="w-full overflow-hidden">
              {entries.length === 0 ? (
                <div className="flex items-center justify-center h-full py-12">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No Scheduled SFS</h3>
                    <p className="mt-2 text-sm text-gray-500">No {activeToggle} scheduled SFS yet.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                      Media
                    </th>
                    <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                      Creator
                    </th>
                    <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                      Slot
                    </th>
                    <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                      Promo Link
                    </th>
                    <th className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-sm font-medium tracking-wider text-center text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      {/* Media Column */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-12 h-12 overflow-hidden bg-gray-200 rounded">
                          <Image
                            src={entry.media.thumbnail}
                            alt="Media thumbnail"
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </td>

                      {/* Date Column */}
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        <div>{entry.date}</div>
                        <div className="text-sm text-gray-500">{entry.time}</div>
                      </td>

                      {/* Creator Column */}
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {entry.creator}
                      </td>

                      {/* Content Slot Column */}
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {entry.contentSlot}
                      </td>

                      {/* Promo Link Column */}
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <a 
                          href={entry.promoLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block max-w-xs text-blue-600 truncate hover:text-blue-800 hover:underline"
                          title={entry.promoLink}
                        >
                          {entry.promoLink.length > 20 ? entry.promoLink.substring(0, 20) + '...' : entry.promoLink}
                        </a>
                      </td>

                      {/* Status Column */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={getStatusBadge(entry.status)}>
                          {entry.status}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-3 text-base font-medium text-center whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 text-gray-400 hover:text-gray-600">
                            <ThreeDotsIcon className="w-5 h-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            {activeToggle === 'received' && entry.status.toLowerCase() === 'pending' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleAction(entry.id, 'approve')}
                                  className="text-green-600 cursor-pointer"
                                >
                                  Accept
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleAction(entry.id, 'decline')}
                                  className="text-red-600 cursor-pointer"
                                >
                                  Reject
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {entry.actions.includes('flag') && (
                              <>
                                <DropdownMenuItem className="text-gray-700 cursor-pointer">
                                  <WarningIcon className="w-4 h-4 mr-2" />
                                  View Flag
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleAction(entry.id, 'delete')}
                              className="text-red-600 cursor-pointer"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              )}
            </div>
          ) : (
            <div className="h-full p-4 overflow-auto">
              <CalendarView />
            </div>
          )}
        </div>
      </div>

      {/* Schedule New SFS Modal */}
      <ScheduleNewSFSModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleScheduleSuccess}
      />
    </div>
  );
};
