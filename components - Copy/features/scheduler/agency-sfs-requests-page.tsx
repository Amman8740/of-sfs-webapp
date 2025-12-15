"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PrimaryButton } from '@/components/ui/button';
import { ExpandIcon, ThreeDotsIcon } from '@/components/ui/icons';
import { BlueSpinner } from '@/components/ui/spinners';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';

interface AgencySFSRequestEntry {
  id: string;
  senderModelName: string;
  receiverModelName: string;
  senderFans: number;
  receiverFans: number;
  matchScore: number;
  compatibility: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Denied' | 'Completed' | 'Waiting';
  type: 'sent' | 'received';
  senderThumbnail?: string;
  receiverThumbnail?: string;
  requestId?: string;
}

interface AgencySFSRequestsPageProps {
  modelId?: string;
}

let requestsCache: { [key: string]: AgencySFSRequestEntry[] } = {};
let cacheTimes: { [key: string]: number } = {};
const CACHE_DURATION = 60 * 1000; // 1 minute

export const AgencySFSRequestsPage: React.FC<AgencySFSRequestsPageProps> = () => {
  const [sentEntries, setSentEntries] = useState<AgencySFSRequestEntry[]>([]);
  const [receivedEntries, setReceivedEntries] = useState<AgencySFSRequestEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [loading, setLoading] = useState(false);

  // Load SFS requests when component mounts
  useEffect(() => {
    loadAllSFSRequests();
  }, []);

  const loadAllSFSRequests = async () => {
    try {
      setLoading(true);

      // Load sent requests
      console.log(`🔄 Fetching SENT requests for agency...`);
      const sentResponse = await fetch(`/api/sfs-requests?type=sent`, {
        signal: AbortSignal.timeout(20000)
      });

      if (sentResponse.ok) {
        const sentData = await sentResponse.json();
        if (sentData.success && sentData.data) {
          const transformedSent = (sentData.data || []).map((req: any) => ({
            id: req.id,
            senderModelName: req.creator || 'Unknown',
            receiverModelName: req.creator || 'Unknown',
            senderFans: req.fanCount || 0,
            receiverFans: 0,
            matchScore: req.matchScore || 0,
            compatibility: 'N/A',
            date: req.date || new Date().toLocaleDateString(),
            status: req.status || 'Pending',
            type: 'sent' as const,
            senderThumbnail: req.media?.thumbnail,
            requestId: req.id
          }));
          setSentEntries(transformedSent);
          console.log(`✅ Loaded ${transformedSent.length} sent requests`);
        }
      } else {
        console.error(`❌ Failed to load sent requests:`, sentResponse.status);
      }

      // Load received requests
      console.log(`🔄 Fetching RECEIVED requests for agency...`);
      const receivedResponse = await fetch(`/api/sfs-requests?type=received`, {
        signal: AbortSignal.timeout(20000)
      });

      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json();
        if (receivedData.success && receivedData.data) {
          const transformedReceived = (receivedData.data || []).map((req: any) => ({
            id: req.id,
            senderModelName: req.creator || 'Unknown',
            receiverModelName: req.creator || 'Unknown',
            senderFans: req.fanCount || 0,
            receiverFans: 0,
            matchScore: req.matchScore || 0,
            compatibility: 'N/A',
            date: req.date || new Date().toLocaleDateString(),
            status: req.status || 'Pending',
            type: 'received' as const,
            senderThumbnail: req.media?.thumbnail,
            requestId: req.id
          }));
          setReceivedEntries(transformedReceived);
          console.log(`✅ Loaded ${transformedReceived.length} received requests`);
        }
      } else {
        console.error(`❌ Failed to load received requests:`, receivedResponse.status);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error loading SFS requests:`, errorMsg);
      toast.error(`Failed to load SFS requests: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      console.log(`📤 Approving request: ${requestId}`);
      
      if (!requestId) {
        throw new Error('Request ID is missing or undefined');
      }
      
      const payload = { requestId, status: 'approved' };
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
        throw new Error(errorData.details || errorData.error || `Failed to approve request (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Request approved:', data);
      toast.success('✅ Request approved successfully!');
      
      // Update local state with new status
      if (activeTab === 'received') {
        setReceivedEntries(prev => prev.map(entry => 
          entry.id === requestId 
            ? { ...entry, status: 'Approved' }
            : entry
        ));
      } else {
        setSentEntries(prev => prev.map(entry => 
          entry.id === requestId 
            ? { ...entry, status: 'Approved' }
            : entry
        ));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error approving request:', errorMsg);
      toast.error(`Failed to approve request: ${errorMsg}`);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      console.log(`📤 Declining request: ${requestId}`);
      
      if (!requestId) {
        throw new Error('Request ID is missing or undefined');
      }
      
      const payload = { requestId, status: 'declined' };
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
        throw new Error(errorData.details || errorData.error || `Failed to decline request (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Request declined:', data);
      toast.success('❌ Request declined successfully!');
      
      // Update local state with new status
      if (activeTab === 'received') {
        setReceivedEntries(prev => prev.map(entry => 
          entry.id === requestId 
            ? { ...entry, status: 'Denied' }
            : entry
        ));
      } else {
        setSentEntries(prev => prev.map(entry => 
          entry.id === requestId 
            ? { ...entry, status: 'Denied' }
            : entry
        ));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error declining request:', errorMsg);
      toast.error(`Failed to decline request: ${errorMsg}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
      case 'waiting':
        return 'bg-yellow-100 text-yellow-700';
      case 'denied':
      case 'declined':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const displayEntries = activeTab === 'sent' ? sentEntries : receivedEntries;

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="pb-4">
        <h1 className="text-2xl font-bold text-gray-900">SFS Requests</h1>
        <p className="mt-1 text-gray-600">Manage all collaboration requests sent and received</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Sent Requests ({sentEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Received Requests ({receivedEntries.length})
        </button>
      </div>

      {/* Table Container */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white border border-gray-200 rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <BlueSpinner />
          </div>
        ) : displayEntries.length === 0 ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <p className="text-gray-600 text-lg">No {activeTab} requests</p>
              <p className="text-gray-400 text-sm mt-1">
                {activeTab === 'sent'
                  ? 'Your collaboration requests will appear here'
                  : 'Incoming requests from other models will appear here'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Sender Model
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Fans
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Receiver Model
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Fans
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Match Score
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    {/* Sender Model */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {entry.senderThumbnail && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                            <img
                              src={entry.senderThumbnail}
                              alt={entry.senderModelName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {entry.senderModelName}
                        </span>
                      </div>
                    </td>

                    {/* Sender Fans */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{entry.senderFans}</span>
                    </td>

                    {/* Receiver Model */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {entry.receiverModelName}
                      </span>
                    </td>

                    {/* Receiver Fans */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{entry.receiverFans}</span>
                    </td>

                    {/* Match Score */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center justify-center w-12 h-8 rounded-lg font-bold text-sm bg-green-100 text-green-700">
                        {entry.matchScore}%
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          entry.status
                        )}`}
                      >
                        {entry.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{entry.date}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activeTab === 'received' && (entry.status === 'Pending' || entry.status === 'Waiting') ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <ThreeDotsIcon />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleApprove(entry.requestId || entry.id)}
                            >
                              ✓ Approve
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDecline(entry.requestId || entry.id)}
                            >
                              ✗ Decline
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
