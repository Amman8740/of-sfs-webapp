"use client";

import React, { useState, useEffect } from 'react';
import { EditIcon, DeleteIcon } from '@/components/ui/icons';
import { Pagination } from '@/components/ui';
import { OvalSpinner } from '@/components/ui/spinners';
import { useToast } from '@/components/ui/toasts/use-toast';
import { useAgencyPeople } from '@/lib/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PersonItem {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Creator';
  agencyId?: string;
}

interface UserRequest {
  id: string;
  creator_id: string;
  name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const PeoplePage: React.FC = () => {
  const { toast } = useToast();
  const {
    people,
    agencyAdmin,
    isLoading: isLoadingPeople,
    fetchPeople,
    removeCreator,
    isRemoving,
  } = useAgencyPeople();
  
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(people.length / pageSize));
  const start = (page - 1) * pageSize;
  const current = people.slice(start, start + pageSize);

  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [processingActions, setProcessingActions] = useState<Map<string, 'approve' | 'reject'>>(new Map());
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [creatorToRemove, setCreatorToRemove] = useState<PersonItem | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Fetch people on mount
  useEffect(() => {
    fetchPeople();
    fetchPendingRequestsCount();
  }, [fetchPeople]);

  // Fetch pending requests count for notification dot
  const fetchPendingRequestsCount = async () => {
    try {
      const response = await fetch('/api/agency/requests?status=pending');
      if (response.ok) {
        const data = await response.json();
        const pendingCount = (data.requests || []).length;
        setPendingRequestsCount(pendingCount);
      }
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
    }
  };

  // Fetch join requests
  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    setRequestError(null);
    try {
      const status = activeTab === 'pending' ? 'pending' : undefined;
      const url = `/api/agency/requests?${status ? `status=${status}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      
      console.log('Raw API response:', data.requests);
      
      // Transform data to match UserRequest interface
      const transformedRequests: UserRequest[] = (data.requests || []).map((req: any) => {
        console.log('Processing request:', {
          id: req.id,
          creator_name: req.creator_name,
          creator_username: req.creator_username,
          creator_email: req.creator_email,
          creator_avatar_url: req.creator_avatar_url,
          keys: Object.keys(req)
        });
        
        return {
          id: req.id,
          creator_id: req.creator_id,
          name: req.creator_name || 'Unknown',
          username: req.creator_username || 'unknown',
          email: req.creator_email || 'Unknown',
          avatar_url: req.creator_avatar_url || null,
          requestedAt: formatTimeAgo(new Date(req.created_at)),
          status: req.status,
        };
      });

      console.log('Transformed requests:', transformedRequests);
      setUserRequests(transformedRequests);
      
      // Count pending requests for the notification dot
      const pendingCount = transformedRequests.filter(req => req.status === 'pending').length;
      setPendingRequestsCount(pendingCount);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequestError('Failed to load requests');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (isRequestsModalOpen) {
      fetchRequests();
    }
  }, [isRequestsModalOpen, activeTab]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleEdit = (id: string) => {
    console.log('Edit person:', id);
    // TODO: Implement edit functionality
  };

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    setProcessingActions(prev => new Map(prev).set(requestId, 'approve'));
    try {
      const response = await fetch('/api/agency/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action: 'approve',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to approve request',
          variant: 'destructive',
        });
        return;
      }

      // Remove from list or update status
      setUserRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      );

      // Update pending count
      setPendingRequestsCount(prev => Math.max(0, prev - 1));

      // Show success notification
      toast({
        title: 'Success',
        description: 'Request approved! Creator has been added.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      setProcessingActions(prev => {
        const newMap = new Map(prev);
        newMap.delete(requestId);
        return newMap;
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    setProcessingActions(prev => new Map(prev).set(requestId, 'reject'));
    try {
      const response = await fetch('/api/agency/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action: 'reject',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to reject request',
          variant: 'destructive',
        });
        return;
      }

      // Remove from list or update status
      setUserRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'rejected' } : req
        )
      );

      // Update pending count
      setPendingRequestsCount(prev => Math.max(0, prev - 1));

      // Show success notification
      toast({
        title: 'Success',
        description: 'Request rejected. Creator has been notified.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      setProcessingActions(prev => {
        const newMap = new Map(prev);
        newMap.delete(requestId);
        return newMap;
      });
    }
  };

  const handleRemoveCreator = async () => {
    if (!creatorToRemove) return;

    const success = await removeCreator(creatorToRemove.id);
    if (success) {
      setIsRemoveDialogOpen(false);
      setCreatorToRemove(null);
    }
  };

  const handleRemoveClick = (person: PersonItem) => {
    setCreatorToRemove(person);
    setIsRemoveDialogOpen(true);
  };

  return (
    <div className="space-y-6 min-h-screen p-6 bg-[#FCFCFC] rounded-tl-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">People</h1>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsRequestsModalOpen(true)}
            className="inline-flex items-center justify-center w-[97px] h-10 gap-2 rounded-xl font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-[#0091FF] text-white hover:bg-[#0081E6]"
          >
            Requests
          </button>
          {pendingRequestsCount > 0 && (
            <span className="absolute w-3 h-3 bg-red-500 border border-white rounded-full -top-1 -right-1"></span>
          )}
        </div>
      </div>

      {/* Requests Modal */}
      <Dialog open={isRequestsModalOpen} onOpenChange={setIsRequestsModalOpen}>
        <DialogContent className="max-w-4xl p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold">Agency Joining Requests</DialogTitle>
          </DialogHeader>
          
          {/* Tabs */}
          <div className="flex gap-8 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'pending'
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending
              {activeTab === 'pending' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'all'
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
              {activeTab === 'all' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></span>
              )}
            </button>
          </div>
          
          {/* Table */}
          <div className="overflow-hidden">
            {isLoadingRequests ? (
              <div className="py-12 text-center text-gray-500">
                Loading requests...
              </div>
            ) : requestError ? (
              <div className="py-12 text-center text-red-500">
                {requestError}
              </div>
            ) : userRequests.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No {activeTab === 'pending' ? 'pending' : ''} requests
              </div>
            ) : (
              <div className="space-y-3">
                {userRequests.map((request, index) => (
                  <div 
                    key={request.id} 
                    className="flex items-center gap-4 p-4 transition-colors bg-white border border-gray-100 rounded-lg hover:bg-gray-50"
                  >
                    {/* Avatar */}
                    <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-blue-100 rounded-full shrink-0">
                      {request.avatar_url ? (
                        <img 
                          src={request.avatar_url} 
                          alt={request.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>
                    
                    {/* Name */}
                    <div className="w-32 shrink-0">
                      <p className="text-sm font-medium text-gray-900">{request.name}</p>
                    </div>
                    
                    {/* Username */}
                    <div className="w-32 shrink-0">
                      <p className="text-sm text-gray-600">@{request.username}</p>
                    </div>
                    
                    {/* Email */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 truncate">{request.email}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    {request.status === 'pending' ? (
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={processingIds.has(request.id)}
                          className="px-6 py-2 text-sm font-medium text-green-700 transition-colors rounded-lg bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingIds.has(request.id) && processingActions.get(request.id) === 'approve' ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          disabled={processingIds.has(request.id)}
                          className="px-6 py-2 text-sm font-medium text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingIds.has(request.id) && processingActions.get(request.id) === 'reject' ? 'Processing...' : 'Decline'}
                        </button>
                      </div>
                    ) : (
                      <div className="shrink-0">
                        <span className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          request.status === 'approved'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {request.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      </div>
                    )}
                    
                    {/* Timestamp with indicator */}
                    <div className="flex items-center gap-2 shrink-0 w-28">
                      <p className="text-sm text-gray-500">{request.requestedAt}</p>
                      {request.status === 'pending' && (
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Creator Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-900">Remove Creator</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to remove <span className="font-medium text-gray-900">{creatorToRemove?.name}</span> from your agency? 
              This action cannot be undone.
            </p>
            
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setIsRemoveDialogOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveCreator}
                disabled={isRemoving}
                className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table Container */}
      <div className="overflow-hidden rounded-lg shadow">
        {isLoadingPeople ? (
          <div className="py-12 text-center text-gray-500 bg-white">
            <OvalSpinner size="medium" className="mx-auto mb-2" />
            Loading people...
          </div>
        ) : people.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white">
            No people found
          </div>
        ) : (
          <table className="min-w-full divide-y divide-[#FCFCFC]">
            <thead className="bg-gray-50">
           
              <tr>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-right text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Show Admin as first row */}
              {agencyAdmin && (
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {agencyAdmin.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {agencyAdmin.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium text-green-800"
                      style={{ backgroundColor: '#E8F5E9' }}
                    >
                      Admin
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    {/* <button 
                      onClick={() => handleEdit(agencyAdmin.id)} 
                      className="p-1 text-gray-400 hover:text-gray-600" 
                      title="Edit"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button> */}
                  </td>
                </tr>
              )}
              
              {/* Show paginated creators */}
              {current.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {person.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {person.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                        person.role === 'Admin' 
                          ? 'text-green-800' 
                          : 'text-blue-700'
                      }`}
                      style={{
                        backgroundColor: person.role === 'Admin' ? '#E8F5E9' : '#E3F2FD'
                      }}
                    >
                      {person.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* <button 
                        onClick={() => handleEdit(person.id)} 
                        className="p-1 text-gray-400 hover:text-gray-600" 
                        title="Edit"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button> */}
                      <button 
                        onClick={() => handleRemoveClick(person)} 
                        disabled={isRemoving && creatorToRemove?.id === person.id}
                        className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                        title="Remove from agency"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {people.length > 0 && (
        <div className="flex items-center justify-center pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showInfo={true}
            totalItems={people.length}
            itemsPerPage={pageSize}
            currentItemsStart={start + 1}
            currentItemsEnd={Math.min(start + pageSize, people.length)}
            itemLabel="people"
          />
        </div>
      )}
    </div>
  );
};

