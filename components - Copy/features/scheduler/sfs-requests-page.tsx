"use client";

import React, { useState } from 'react';
import { PrimaryButton } from '@/components/ui/button';
import { ThreeDotsIcon } from '@/components/ui/icons';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';

interface SFSRequestEntry {
  id: string;
  model: string;
  promoName: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Declined';
  actions: string[];
}

interface SFSRequestsPageProps {
  data?: any;
  mutateData?: () => void;
}

export const SFSRequestsPage: React.FC<SFSRequestsPageProps> = ({ data, mutateData }) => {
  const [entries, setEntries] = useState<SFSRequestEntry[]>([
    {
      id: '1',
      model: '@model1',
      promoName: 'Summer Promotion',
      requestDate: '2024-01-15',
      status: 'Pending',
      actions: ['approve', 'decline', 'details']
    },
    {
      id: '2', 
      model: '@model2',
      promoName: 'New Year Special',
      requestDate: '2024-01-14',
      status: 'Approved',
      actions: ['details']
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleScheduleNew = () => {
    console.log('Schedule New SFS Request clicked');
  };

  const handleAction = (id: string, action: string) => {
    console.log(`Action ${action} for entry ${id}`);
    
    if (action === 'approve') {
      setEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, status: 'Approved' as const } : entry
      ));
    } else if (action === 'decline') {
      setEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, status: 'Declined' as const } : entry
      ));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SFS Requests</h1>
          <p className="mt-1 text-gray-600">Manage incoming SFS requests from creators</p>
        </div>
        <PrimaryButton onClick={handleScheduleNew}>
          New SFS Request
        </PrimaryButton>
      </div>

      {/* Table Container */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white border border-gray-200 rounded-lg shadow">
        {loading ? (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    <input type="checkbox" className="rounded" disabled />
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Creator
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Promo Name
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Request Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(6)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="h-4 w-40 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center flex-1 py-12">
            <div className="text-center">
              <div className="mb-4 text-gray-400">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">No SFS Requests</h3>
              <p className="mb-4 text-gray-500">Get started by creating your first SFS request.</p>
              <PrimaryButton onClick={handleScheduleNew}>
                Create SFS Request
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Creator
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Promo Name
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Request Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-gray-50">
                    {/* Checkbox */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <input type="checkbox" className="rounded" />
                    </td>

                    {/* Creator */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{entry.model}</span>
                    </td>

                    {/* Promo Name */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{entry.promoName}</span>
                    </td>

                    {/* Request Date */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{entry.requestDate}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3 space-x-2 text-sm font-medium whitespace-nowrap">
                      {entry.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleAction(entry.id, 'approve')}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-white transition-colors bg-green-600 rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(entry.id, 'decline')}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-white transition-colors bg-red-600 rounded hover:bg-red-700"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex items-center justify-center p-1 text-gray-400 rounded hover:text-gray-600 hover:bg-gray-100">
                            <ThreeDotsIcon className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction(entry.id, 'details')}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {entry.status === 'Pending' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleAction(entry.id, 'approve')}
                                className="text-green-600"
                              >
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleAction(entry.id, 'decline')}
                                className="text-red-600"
                              >
                                Decline
                              </DropdownMenuItem>
                            </>
                          )}
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
    </div>
  );
};
