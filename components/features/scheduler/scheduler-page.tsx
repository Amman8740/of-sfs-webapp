"use client";

import React, { useState, useEffect } from 'react';
import { ScheduledSFSPage } from './scheduled-sfs-page';
import { SmartMatchPage } from './smart-match-page';
import { SFSRequestsPageNew } from './sfs-requests-page-new';
import { ScheduledSFSDataTable } from './scheduled-sfs-listing/scheduled-sfs-table';
import { createColumns } from './scheduled-sfs-listing/scheduled-sfs-columns';
import { ListIcon, CalendarIcon, PlusIcon, Button } from '@/components/ui';
import { ScheduleNewSFSModal } from './schedule-new-sfs-modal';
import { CalendarView } from './calendar-view';
import { SmartMatchDataTable } from './smart-match-listing/smart-match-table';
import { createSmartMatchColumns } from './smart-match-listing/smart-match-columns';
import { MediaDetailsModal } from './media-details-modal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SchedulerPageProps {
  data?: any;
  mutateData?: () => void;
  selectedOption?: string;
  userType?: 'agency' | 'creator';
  modelId?: string;
}

export const SchedulerPage: React.FC<SchedulerPageProps> = ({ data = { scheduledSFS: [] }, mutateData, selectedOption = 'scheduled-sfs', userType = 'agency', modelId }) => {
  const [activeTab, setActiveTab] = useState<'scheduled-sfs' | 'smart-match' | 'sfs-requests'>(
    selectedOption === 'smart-match' ? 'smart-match' : selectedOption === 'sfs-requests' ? 'sfs-requests' : 'scheduled-sfs'
  );
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [refreshKey, setRefreshKey] = useState(0);
  const [mediaDetails, setMediaDetails] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const handleMediaExpand = (media: any) => {
    console.log("🚀 ~ handleMediaExpand ~ media:", media)
    // setMediaDetails(media);

    // Add dummy data for demonstration
    setMediaDetails({
      date: media?.date ?? "2024-06-03",
      imageUrl: media?.thumbnail ?? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=face",
      category: media?.category ?? ['ZZC', 'Promo'],
      hashtags: (media?.tags ?? ['#Promo', '#SFS', '#OnlyFans']).map((t: string) => t.replace('#', '')),
      caption: media?.caption ?? 'This is a dummy caption for the SFS post.',
      notes: media?.notes ?? 'These are some dummy notes about the video.',
      creator: media?.creator ?? 'model_daisy',
      id: media?.id ?? 'sfstest001',
      stats: {
        likes: 1240,
        comments: 215,
        reposts: 30
      }
    });
  };

  const handleDeleteScheduledSFS = (scheduledSFS: any) => {
    setItemToDelete(scheduledSFS);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/scheduled-sfs/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the data
        fetchData();
        setRefreshKey(prev => prev + 1);
        toast.success('Scheduled SFS deleted successfully');
      } else {
        const error = await response.json();
        toast.error(`Failed to delete: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting scheduled SFS:', error);
      toast.error('Failed to delete scheduled SFS');
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  const handleViewModeChange = (mode: 'list' | 'calendar') => {
    setViewMode(mode);
  };

  const handleScheduleNew = () => {
    setShowScheduleModal(true);
  };

  // Update activeTab when selectedOption changes
  useEffect(() => {
    if (selectedOption === 'smart-match') {
      setActiveTab('smart-match');
    } else if (selectedOption === 'sfs-requests') {
      setActiveTab('sfs-requests');
    } else {
      setActiveTab('scheduled-sfs');
    }
  }, [selectedOption]);

  // Fetch real data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scheduled-sfs');
      if (response.ok) {
        const result = await response.json();
        setRealData({ scheduledSFS: result.data || [] });
      } else {
        console.error('Failed to fetch scheduled SFS');
      }
    } catch (error) {
      console.error('Error fetching scheduled SFS:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentData = realData || data;

  const renderContent = () => {
    switch (activeTab) {
      case 'scheduled-sfs':
        return <ScheduledSFSPage data={data} mutateData={mutateData} />;
      case 'smart-match':
        return (
          <div className='border border-canvas-bg-active rounded-2xl'>
            <SmartMatchPage userType={userType} modelId={modelId} />
          </div>
        )

      case 'sfs-requests':
        return <SFSRequestsPageNew data={data} mutateData={mutateData} modelId={modelId} />;
      default:
        return <ScheduledSFSPage data={data} mutateData={mutateData} />;
    }
  };

  return (
    <div className="space-y-6 min-h-screen p-6 bg-[#FCFCFC] rounded-tl-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">SFS Scheduler</h1>
        <Button
          onClick={handleScheduleNew}
          // className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg"
          style={{ backgroundColor: '#0091FF' }} color={'primary'} size={'small'} variant={'solid'}        >
          <PlusIcon className="w-4 h-4" />
          Schedule New SFS
        </Button>
      </div>
      {renderContent()}
      <ScheduleNewSFSModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={(data) => {
          console.log('New SFS scheduled:', data);
          // Refetch data to show the new entry
          fetchData();
          setRefreshKey(prev => prev + 1);
          setShowScheduleModal(false);
        }}
      />
      <MediaDetailsModal
        isOpen={!!mediaDetails}
        onClose={() => setMediaDetails(null)}
        details={mediaDetails}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scheduled SFS</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scheduled SFS? This will also delete any related SFS requests and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              color="gray"
              size="medium"
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="alert"
              size="medium"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};