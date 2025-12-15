"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EditIcon, DeleteIcon, PlusIcon, UploadIcon } from '@/components/ui/icons';
import { MediaDetailsModal } from '@/components/features/scheduler/media-details-modal';
import { BulkUploadSection } from './bulk-upload-section';
import { Select } from '@/components/ui/select/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { BatchMediaEditModal } from './batch-media-edit-modal';
import { ConfirmBatchEditModal } from './confirm-batch-edit-modal';
import { UploadProgressToast } from './upload-progress-toast';
import { OperationProgress } from './operation-progress';
import { MediaDataTable } from './media-listing/media-table';
import { createColumns } from './media-listing/media-columns';
import { Tables } from '@/types_db';
import { toast } from 'sonner';
import { MediaEditModal } from './media-edit-modal';

// interface MediaItem {
//   id: string;
//   imageUrl: string;
//   category: string;
//   tagCreators: string;
//   hashtags: string;
//   caption: string;
//   notes: string;
//   selected: boolean;
// }

type MediaItem = Tables<'media_items'>

type Model = {
  id: string;
  name: string;
  username: string;
}

// const mockMediaData: MediaItem[] = [
//   {
//     id: '1',
//     file_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop&crop=face',
//     category: 'Nature',
//     tag_creators: ['@user123'],
//     hashtags: ['#travel', '#clouds'],
//     caption: 'This is a test caption',
//     notes: 'Should be posted in even...',
//     created_at: '2025-01-01',
//     file_name: '',
//     file_size: null,
//     file_type: '',
//     model_id: null,
//     posted_at: null,
//     scheduled_for: null,
//     status: null,
//     thumbnail_url: null,
//     updated_at: null,
//     user_id: 'user-1',
//   },
//   {
//     id: '2',
//     file_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
//     category: 'People',
//     tag_creators: ['@influencerA'],
//     hashtags: ['#portrait', '#smile'],
//     caption: 'Portrait vibes',
//     notes: 'Use as profile teaser',
//     created_at: '2025-01-02',
//     file_name: 'portrait.jpg',
//     file_size: 345678,
//     file_type: 'image/jpeg',
//     model_id: null,
//     posted_at: null,
//     scheduled_for: null,
//     status: 'draft',
//     thumbnail_url: null,
//     updated_at: null,
//     user_id: 'user-1',
//   },
//   {
//     id: '3',
//     file_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&h=150&fit=crop',
//     category: 'Travel',
//     tag_creators: ['@wanderer'],
//     hashtags: ['#beach', '#sunset'],
//     caption: 'Golden hour',
//     notes: 'Highlight for summer campaign',
//     created_at: '2025-01-03',
//     file_name: 'beach.png',
//     file_size: 287000,
//     file_type: 'image/png',
//     model_id: null,
//     posted_at: null,
//     scheduled_for: null,
//     status: 'scheduled',
//     thumbnail_url: null,
//     updated_at: null,
//     user_id: 'user-1',
//   },
//   {
//     id: '4',
//     file_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=150&h=150&fit=crop',
//     category: 'Food',
//     tag_creators: ['@chef123'],
//     hashtags: ['#foodie', '#brunch'],
//     caption: 'Sunday brunch',
//     notes: 'For IG story',
//     created_at: '2025-01-04',
//     file_name: 'brunch.jpg',
//     file_size: 192000,
//     file_type: 'image/jpeg',
//     model_id: null,
//     posted_at: null,
//     scheduled_for: null,
//     status: 'posted',
//     thumbnail_url: null,
//     updated_at: null,
//     user_id: 'user-1',
//   },
//   {
//     id: '5',
//     file_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=150&h=150&fit=crop',
//     category: 'Lifestyle',
//     tag_creators: ['@lifestyler'],
//     hashtags: ['#relax', '#cozy'],
//     caption: 'Chill day',
//     notes: 'For FB and IG',
//     created_at: '2025-01-05',
//     file_name: 'cozy_day.jpg',
//     file_size: 223000,
//     file_type: 'image/jpeg',
//     model_id: null,
//     posted_at: null,
//     scheduled_for: null,
//     status: 'draft',
//     thumbnail_url: null,
//     updated_at: null,
//     user_id: 'user-1',
//   },
//   {
//     id: '6',
//     file_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop',
//     category: 'People',
//     tag_creators: ['@modelx'],
//     hashtags: ['#fashion', '#style'],
//     caption: 'Behind the scenes',
//     notes: 'For campaign launch',
//     created_at: '2025-01-06',
//     file_name: 'bts.jpg',
//     file_size: 312000,
//     file_type: 'image/jpeg',
//     model_id: null,
//     posted_at: null,
//     scheduled_for: null,
//     status: 'scheduled',
//     thumbnail_url: null,
//     updated_at: null,
//     user_id: 'user-1',
//   },
//   {
//     id: '7',
//     file_url: 'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=150&h=150&fit=crop',
//     category: 'Tech',
//     tag_creators: ['@techguru'],
//     hashtags: ['#innovation', '#future'],
//     caption: 'AI is the future',
//     notes: 'For Twitter post',
//     created_at: '2025-01-07',
//     file_name: 'ai_future.png',
//     file_size: 410000,
//     file_type: 'image/png',
//     model_id: null,
//     posted_at: null,
//     scheduled_for: null,
//     status: 'draft',
//     thumbnail_url: null,
//     updated_at: null,
//     user_id: 'user-1',
//   },
//   {
//     id: '8',
//     file_url: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=150&h=150&fit=crop',
//     category: 'Architecture',
//     tag_creators: ['@urbaneye'],
//     hashtags: ['#city', '#design'],
//     caption: 'Urban beauty',
//     notes: 'For website hero section',
//     created_at: '2025-01-08',
//     file_name: 'building.jpg',
//     file_size: 350000,
//     file_type: 'image/jpeg',
//     model_id: null,
//     posted_at: null,
//     scheduled_for: null,
//     status: 'posted',
//     thumbnail_url: null,
//     updated_at: null,
//     user_id: 'user-1',
//   },
//   {
//     id: '9',
//     file_url: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=150&h=150&fit=crop',
//     category: 'Art',
//     tag_creators: ['@artistx'],
//     hashtags: ['#creative', '#painting'],
//     caption: 'Art speaks',
//     notes: 'Gallery preview',
//     created_at: '2025-01-09',
//     file_name: 'art.jpg',
//     file_size: 210000,
//     file_type: 'image/jpeg',
//     model_id: null,
//     posted_at: null,
//     scheduled_for: null,
//     status: 'scheduled',
//     thumbnail_url: null,
//     updated_at: null,
//     user_id: 'user-1',
//   },
//   {
//     id: '10',
//     file_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&h=150&fit=crop',
//     category: 'Events',
//     tag_creators: ['@host'],
//     hashtags: ['#concert', '#fun'],
//     caption: 'Let the show begin',
//     notes: 'For campaign reel',
//     created_at: '2025-01-10',
//     file_name: 'concert.mp4',
//     file_size: 1200000,
//     file_type: 'video/mp4',
//     model_id: null,
//     posted_at: null,
//     scheduled_for: null,
//     status: 'draft',
//     thumbnail_url: null,
//     updated_at: null,
//     user_id: 'user-1',
//   },
//   {
//     id: '11',
//     file_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop',
//     category: 'Fashion',
//     tag_creators: ['@stylist'],
//     hashtags: ['#outfit', '#trend'],
//     caption: 'Street style',
//     notes: 'Instagram reel teaser',
//     created_at: '2025-01-11',
//     file_name: 'street_style.jpg',
//     file_size: 275000,
//     file_type: 'image/jpeg',
//     model_id: null,
//     posted_at: null,
//     scheduled_for: null,
//     status: 'posted',
//     thumbnail_url: null,
//     updated_at: null,
//     user_id: 'user-1',
//   },
// ];


export const MediaUploadPage: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showBatchEditModal, setShowBatchEditModal] = useState(false);
  const [showUploadToast, setShowUploadToast] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [showConfirmBatchEdit, setShowConfirmBatchEdit] = useState(false);
  const [batchEditData, setBatchEditData] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<{ user_type?: string; id?: string; profile_data?: any } | null>(null);
  const [creators, setCreators] = useState<Model[]>([]);
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  const [caption, setCaption] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [hashtags, setHashtags] = useState<string>('');
  const [currentHashtagInput, setCurrentHashtagInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMediaItem, setEditingMediaItem] = useState<MediaItem | null>(null);
  const [operationProgress, setOperationProgress] = useState<{ isVisible: boolean; title: string; progress: number; total: number; status: 'processing' | 'completed' | 'failed' }>({ isVisible: false, title: '', progress: 0, total: 0, status: 'processing' });
  const [operationType, setOperationType] = useState<'upload' | 'edit' | 'delete' | null>(null);

  // Fetch media items, models, and user profile on component mount
  useEffect(() => {
    fetchMediaItems();
    fetchModels();
    fetchUserProfile();
    fetchCreators();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user-profile');
      if (response.ok) {
        const result = await response.json();
        // Store both user profile and user ID
        setUserProfile({
          ...result.userProfile,
          id: result.user?.id  // Get user ID from auth user
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchMediaItems = async () => {
    try {
      const response = await fetch('/api/vault');
      if (response.ok) {
        const result = await response.json();
        setMediaItems(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching media items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      if (response.ok) {
        const result = await response.json();
        setModels(result.data || []);
        // Set first model as default if available
        if (result.data && result.data.length > 0 && !selectedModelId) {
          setSelectedModelId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/creators?limit=1000');
      if (response.ok) {
        const result = await response.json();
        setCreators(result.data || []);
      } else {
        console.error('Failed to fetch creators:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === mediaItems.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all
      setSelectedItems(new Set(mediaItems.map(item => item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleEdit = (media: MediaItem) => {
    setEditingMediaItem(media);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedData: Partial<MediaItem> & { newImageFile?: File | null }) => {
    if (!editingMediaItem) return;

    try {
      // For vault, we don't handle file updates, just metadata
      const response = await fetch(`/api/vault/${editingMediaItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption: updatedData.caption || null,
          category: updatedData.category || null,
          tag_creators: updatedData.tag_creators || [],
          hashtags: Array.isArray(updatedData.hashtags) ? updatedData.hashtags : [],
          notes: updatedData.notes || null,
          model_id: updatedData.model_id || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update the media item in local state
        setMediaItems(prev => prev.map(item =>
          item.id === editingMediaItem.id ? { ...item, ...result.data } : item
        ));
        toast.success("Media updated", {
          description: "The media item has been successfully updated.",
        });
        setShowEditModal(false);
        setEditingMediaItem(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update media item');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error("Update failed", {
        description: error instanceof Error ? error.message : "Failed to update the media item.",
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/vault/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setMediaItems(prev => prev.filter(item => item.id !== id));
        toast.success("Media deleted", {
          description: "The media item has been successfully deleted.",
        });
      } else {
        const errorData = await response.json();
        toast.error("Delete failed", {
          description: errorData.error || "Failed to delete media item.",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Delete failed", {
        description: "An unexpected error occurred while deleting the media item.",
      });
    }
  };

  const handleBulkEdit = () => {
    const selectedItemsArray = Array.from(selectedItems);
    // console.log('Bulk edit:', selectedItemsArray);
  };

  const handleBulkDelete = async () => {
    const selectedItemsArray = Array.from(selectedItems);
    if (selectedItemsArray.length === 0) return;

    setOperationType('delete');
    const isSingleDelete = selectedItemsArray.length === 1;
    setOperationProgress({
      isVisible: true,
      title: 'Deleting media',
      progress: 0,
      total: isSingleDelete ? 100 : selectedItemsArray.length,
      status: 'processing',
    });

    try {
      let successCount = 0;
      let failCount = 0;
      const isSingleItem = selectedItemsArray.length === 1;

      // Delete items one by one to show progress
      for (let i = 0; i < selectedItemsArray.length; i++) {
        const id = selectedItemsArray[i];
        
        // Simulate progress for single item deletions
        if (isSingleItem) {
          await simulateProgress((step) => {
            setOperationProgress(prev => ({
              ...prev,
              progress: step,
              status: 'processing',
            }));
          });
        }

        try {
          const response = await fetch(`/api/vault/${id}`, { method: 'DELETE' });
          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }

        // Update progress
        if (!isSingleItem) {
          setOperationProgress(prev => ({
            ...prev,
            progress: i + 1,
            status: failCount === 0 ? 'processing' : 'failed',
          }));
        } else {
          // For single item, set to 100% after completion
          setOperationProgress(prev => ({
            ...prev,
            progress: 1,
            status: failCount === 0 ? 'processing' : 'failed',
          }));
        }
      }

      // Remove successfully deleted items from local state
      setMediaItems(prev => prev.filter(item => !selectedItemsArray.includes(item.id)));
      setSelectedItems(new Set());

      // Show final status
      if (failCount === 0) {
        setOperationProgress(prev => ({ ...prev, status: 'completed' }));
        toast.success("Bulk delete completed", {
          description: `Successfully deleted ${successCount} media item(s).`,
        });
      } else {
        setOperationProgress(prev => ({ ...prev, status: 'failed' }));
        toast.error("Bulk delete partially completed", {
          description: `Deleted ${successCount} item(s), but ${failCount} failed.`,
        });
      }

      // Hide progress after 2 seconds
      setTimeout(() => {
        setOperationProgress(prev => ({ ...prev, isVisible: false }));
      }, 2000);
    } catch (error) {
      console.error('Bulk delete error:', error);
      setOperationProgress(prev => ({ ...prev, status: 'failed' }));
      toast.error("Bulk delete failed", {
        description: "An unexpected error occurred during bulk delete.",
      });
      setTimeout(() => {
        setOperationProgress(prev => ({ ...prev, isVisible: false }));
      }, 2000);
    }
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("No files selected", {
        description: "Please select files to upload.",
      });
      return;
    }

    // For creators, don't require model selection
    if (userProfile?.user_type !== 'creator' && !selectedModelId) {
      toast.error("Model required", {
        description: "Please select a model for the upload.",
      });
      return;
    }

    setUploading(true);
    setOperationType('upload');
    const isSingleFile = uploadedFiles.length === 1;
    setOperationProgress({
      isVisible: true,
      title: 'Uploading media',
      progress: 0,
      total: isSingleFile ? 100 : uploadedFiles.length,
      status: 'processing',
    });

    try {
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Only add model_id if user is not a creator
      if (userProfile?.user_type !== 'creator') {
        formData.append('model_id', selectedModelId);
      }

      // Add tagged creators if any are selected
      if (selectedCreatorIds.length > 0) {
        formData.append('tagged_creators', JSON.stringify(selectedCreatorIds));
      }

      // Add additional metadata fields
      if (caption.trim()) {
        formData.append('caption', caption.trim());
      }
      if (category.trim()) {
        formData.append('category', category.trim());
      }
      if (hashtags.trim()) {
        formData.append('hashtags', hashtags.trim());
      }
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      // Upload files to storage first
      const uploadResponse = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        setOperationProgress(prev => ({ ...prev, status: 'failed' }));
        toast.error("Upload failed", {
          description: uploadResult.error || 'Unknown error occurred.',
        });
        setTimeout(() => {
          setOperationProgress(prev => ({ ...prev, isVisible: false }));
        }, 2000);
        setUploading(false);
        return;
      }

      // Save uploaded files to vault
      const successfulUploads = uploadResult.uploads?.filter((u: any) => u.success) || [];
      
      if (successfulUploads.length === 0) {
        setOperationProgress(prev => ({ ...prev, status: 'failed' }));
        toast.error("No files uploaded", {
          description: "No files were successfully uploaded.",
        });
        setTimeout(() => {
          setOperationProgress(prev => ({ ...prev, isVisible: false }));
        }, 2000);
        setUploading(false);
        return;
      }

      // Convert creator IDs to creator names
      const creatorNames = selectedCreatorIds
        .map(id => {
          const creator = creators.find(c => c.id === id);
          return creator ? (creator.name || creator.username) : null;
        })
        .filter((name): name is string => name !== null);

      let savedCount = 0;
      const failedVaults: string[] = [];
      const isSingleFile = successfulUploads.length === 1;

      // Save to vault one by one to show progress
      for (let i = 0; i < successfulUploads.length; i++) {
        const upload = successfulUploads[i];
        
        // Simulate progress for single file uploads
        if (isSingleFile) {
          await simulateProgress((step) => {
            setOperationProgress(prev => ({
              ...prev,
              progress: step,
              status: 'processing',
            }));
          });
        }

        try {
          const response = await fetch('/api/vault', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file_url: upload.media_item.file_url,
              file_name: upload.file_name,
              file_type: upload.media_item.file_type,
              file_size: upload.media_item.file_size,
              thumbnail_url: null,
              caption: caption.trim() || null,
              category: category.trim() || null,
              tag_creators: creatorNames,
              hashtags: hashtags.split(',').map((h: string) => h.trim()).filter((h: string) => h),
              notes: notes.trim() || null,
              model_id: userProfile?.id || null,
              status: 'draft'
            }),
          });

          if (response.ok) {
            savedCount++;
          } else {
            const data = await response.json();
            failedVaults.push(`${upload.file_name}: ${data?.error || 'Unknown error'}`);
          }
        } catch (error) {
          failedVaults.push(`${upload.file_name}: Request failed`);
        }

        // Update progress
        if (!isSingleFile) {
          setOperationProgress(prev => ({
            ...prev,
            progress: i + 1,
            status: failedVaults.length === 0 ? 'processing' : 'failed',
          }));
        } else {
          // For single file, set to 100% after completion
          setOperationProgress(prev => ({
            ...prev,
            progress: 1,
            status: failedVaults.length === 0 ? 'processing' : 'failed',
          }));
        }
      }

      if (failedVaults.length === 0) {
        setOperationProgress(prev => ({ ...prev, status: 'completed' }));
        toast.success("Upload successful", {
          description: `Uploaded ${savedCount} file${savedCount !== 1 ? 's' : ''} to vault successfully.`,
        });
        // Clear uploaded files from frontend after successful upload
        setUploadedFiles([]);
        setSelectedCreatorIds([]); // Reset selected creators
        setCaption(''); // Reset caption
        setCategory(''); // Reset category
        setHashtags(''); // Reset hashtags
        setCurrentHashtagInput(''); // Reset current hashtag input
        setNotes(''); // Reset notes
        setShowUploadSection(false); // Hide the upload section after successful upload
        // Refresh media list to show newly uploaded items
        fetchMediaItems();
      } else {
        setOperationProgress(prev => ({ ...prev, status: 'failed' }));
        const errorDetails = failedVaults.length > 0 ? `\n${failedVaults.join('\n')}` : '';
        toast.error("Upload partially failed", {
          description: `Successfully saved ${savedCount} of ${successfulUploads.length} files to vault.${errorDetails}`,
        });
        if (savedCount > 0) {
          // Still refresh to show the successful ones
          fetchMediaItems();
        }
      }

      // Hide progress after 2 seconds
      setTimeout(() => {
        setOperationProgress(prev => ({ ...prev, isVisible: false }));
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setOperationProgress(prev => ({ ...prev, status: 'failed' }));
      toast.error("Upload failed", {
        description: 'An unexpected error occurred. Please try again.',
      });
      setTimeout(() => {
        setOperationProgress(prev => ({ ...prev, isVisible: false }));
      }, 2000);
    } finally {
      setUploading(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleAddMediaClick = () => {
    setShowUploadSection(true);
  };
  const handleBatchEdit = () => {
    setShowBatchEditModal(true);
  };
  const handleConfirmProceed = async () => {
    if (!batchEditData) return;

    const selectedItemsArray = Array.from(selectedItems);
    if (selectedItemsArray.length === 0) return;

    setShowConfirmBatchEdit(false);
    setOperationType('edit');
    const isSingleEdit = selectedItemsArray.length === 1;
    setOperationProgress({
      isVisible: true,
      title: 'Updating media',
      progress: 0,
      total: isSingleEdit ? 100 : selectedItemsArray.length,
      status: 'processing',
    });

    try {
      // Filter out empty fields - only send fields that have values
      const filteredEditData: any = {};
      
      if (batchEditData.caption && batchEditData.caption.trim()) {
        filteredEditData.caption = batchEditData.caption.trim();
      }
      if (batchEditData.category && batchEditData.category.trim()) {
        filteredEditData.category = batchEditData.category.trim();
      }
      if (batchEditData.notes && batchEditData.notes.trim()) {
        filteredEditData.notes = batchEditData.notes.trim();
      }
      if (batchEditData.hashtags && batchEditData.hashtags.length > 0) {
        filteredEditData.hashtags = batchEditData.hashtags;
      }
      if (batchEditData.tag_creators && batchEditData.tag_creators.length > 0) {
        filteredEditData.tag_creators = batchEditData.tag_creators;
      }
      if (batchEditData.is_public !== undefined && batchEditData.is_public !== false) {
        filteredEditData.is_public = batchEditData.is_public;
      }

      // Update items one by one to show progress
      let successCount = 0;
      let failCount = 0;
      const updatedItemsMap: { [key: string]: any } = {};
      const isSingleItem = selectedItemsArray.length === 1;

      for (let i = 0; i < selectedItemsArray.length; i++) {
        const id = selectedItemsArray[i];
        
        // Simulate progress for single item edits
        if (isSingleItem) {
          await simulateProgress((step) => {
            setOperationProgress(prev => ({
              ...prev,
              progress: step,
              status: 'processing',
            }));
          });
        }

        try {
          const response = await fetch(`/api/vault/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(filteredEditData),
          });

          if (response.ok) {
            successCount++;
            updatedItemsMap[id] = filteredEditData;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }

        // Update progress
        if (!isSingleItem) {
          setOperationProgress(prev => ({
            ...prev,
            progress: i + 1,
            status: failCount === 0 ? 'processing' : 'failed',
          }));
        } else {
          // For single item, set to 100% after completion
          setOperationProgress(prev => ({
            ...prev,
            progress: 1,
            status: failCount === 0 ? 'processing' : 'failed',
          }));
        }
      }

      // Update local state for successful updates
      const updatedItems = mediaItems.map(item => {
        if (updatedItemsMap[item.id]) {
          return { ...item, ...updatedItemsMap[item.id] };
        }
        return item;
      });
      setMediaItems(updatedItems);

      // Show final status
      if (failCount === 0) {
        setOperationProgress(prev => ({ ...prev, status: 'completed' }));
        toast.success("Bulk edit completed", {
          description: `Successfully updated ${successCount} item${successCount !== 1 ? 's' : ''}.`,
        });
      } else {
        setOperationProgress(prev => ({ ...prev, status: 'failed' }));
        toast.error("Bulk edit partially completed", {
          description: `Updated ${successCount} item${successCount !== 1 ? 's' : ''}, failed to update ${failCount} item${failCount !== 1 ? 's' : ''}.`,
        });
      }

      setSelectedItems(new Set());
      setBatchEditData(null);

      // Hide progress after 2 seconds
      setTimeout(() => {
        setOperationProgress(prev => ({ ...prev, isVisible: false }));
      }, 2000);
    } catch (error) {
      console.error('Bulk edit error:', error);
      setOperationProgress(prev => ({ ...prev, status: 'failed' }));
      toast.error("Bulk edit failed", {
        description: "An unexpected error occurred during bulk edit.",
      });
      setTimeout(() => {
        setOperationProgress(prev => ({ ...prev, isVisible: false }));
      }, 2000);
    }
  };

  const selectedCount = selectedItems.size;

  // Helper function to simulate progress for single file operations
  const simulateProgress = async (onProgress: (progress: number) => void) => {
    const steps = [10, 30, 50, 70, 90];
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 150));
      onProgress(step);
    }
  };

  return (
    <div className="space-y-6 min-h-screen p-6 bg-[#FCFCFC] rounded-tl-xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Upload</h1>
        </div>
        {!showUploadSection && (
        <button
          onClick={handleAddMediaClick}
          className="flex items-center justify-center gap-2 font-medium text-white transition-colors rounded-xl"
          style={{
            backgroundColor: '#0091FF',
            width: '127px',
            height: '40px',
            gap: '8px',
            borderRadius: '12px',
            paddingTop: '0px',
            paddingRight: '16px',
            paddingBottom: '0px',
            paddingLeft: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap'
          }}
        >
          <PlusIcon className="flex-shrink-0 w-4 h-4" />
          <span className="flex-shrink-0">Add media</span>
        </button>
        )}
      </div>

      {/* Main Upload Card */}
      {showUploadSection && (
      <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        {/* Media Details Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Media details</h2>
            <button
              onClick={() => setShowUploadSection(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Close media details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {userProfile?.user_type !== 'creator' && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Model</label>
                <Select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  options={models.map(model => ({
                    value: model.id,
                    label: model.name || model.username
                  }))}
                  placeholder="Select model"
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Tag Creators</label>
              <MultiSelect
                value={selectedCreatorIds}
                onChange={setSelectedCreatorIds}
                options={creators.map(creator => ({
                  value: creator.id,
                  label: creator.name || creator.username
                }))}
                placeholder="Select creators to tag"
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Caption</label>
              <Input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter caption"
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
              <Input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter category"
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Hashtags</label>
              <div className="w-full">
                {/* Hashtag Input with Inline Badges */}
                <div className="relative">
                  <div className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <div className="flex flex-wrap items-center gap-1">
                      {/* Render existing hashtags as badges */}
                      {hashtags.split(',').map((hashtag, index) => {
                        const trimmedHashtag = hashtag.trim();
                        if (!trimmedHashtag) return null;

                        // Check if it starts with # or add it
                        const displayHashtag = trimmedHashtag.startsWith('#') ? trimmedHashtag : `#${trimmedHashtag}`;

                        return (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 border border-blue-200 rounded-md"
                          >
                            {displayHashtag}
                            <button
                              type="button"
                              onClick={() => {
                                const currentHashtags = hashtags.split(',');
                                const newHashtags = currentHashtags.filter((_, i) => i !== index).join(',').trim();
                                setHashtags(newHashtags);
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        );
                      })}
                      {/* Input field for new hashtags */}
                      <input
                        type="text"
                        value={currentHashtagInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCurrentHashtagInput(value);
                          
                          // Check if comma or space was pressed
                          if (value.includes(',') || value.includes(' ')) {
                            // When comma or space is pressed, add the current input as a hashtag
                            const newHashtag = value.replace(/[, ]/g, '').trim();
                            if (newHashtag) {
                              const formattedHashtag = newHashtag.startsWith('#') ? newHashtag : '#' + newHashtag;
                              const currentHashtags = hashtags ? `${hashtags}, ${formattedHashtag}` : formattedHashtag;
                              setHashtags(currentHashtags);
                              setCurrentHashtagInput(''); // Clear the input
                            } else {
                              setCurrentHashtagInput(''); // Clear if empty
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && currentHashtagInput === '' && hashtags.includes(',')) {
                            // Remove last hashtag when backspace is pressed on empty input
                            const hashtagArray = hashtags.split(',');
                            hashtagArray.pop();
                            setHashtags(hashtagArray.join(',').trim());
                          } else if (e.key === 'Enter') {
                            // Allow Enter key to add hashtag
                            e.preventDefault();
                            const newHashtag = currentHashtagInput.trim();
                            if (newHashtag) {
                              const formattedHashtag = newHashtag.startsWith('#') ? newHashtag : '#' + newHashtag;
                              const currentHashtags = hashtags ? `${hashtags}, ${formattedHashtag}` : formattedHashtag;
                              setHashtags(currentHashtags);
                              setCurrentHashtagInput(''); // Clear the input
                            }
                          }
                        }}
                        placeholder={hashtags ? "" : "Type hashtags (press comma, space, or Enter to add)"}
                        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                        style={{ border: 'none', boxShadow: 'none' }}
                      />
                    </div>
                  </div>
                </div>
            
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Notes</label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes"
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2 text-green-600 md:col-span-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                {userProfile?.user_type === 'creator' ? 'Creator Account' : 'Account Successfully linked'}
              </span>
            </div>
          </div>
        </div>

        {/* Select Media Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Select Media</h2>

          {uploadedFiles.length === 0 ? (
            /* Upload Area - Initial State */
            <div className="p-8 text-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
              {/* Upload Icon */}
              <div className="flex justify-center mb-4">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M27.665 36.89C27.4825 36.6157 27.235 36.3907 26.9445 36.2351C26.654 36.0795 26.3296 35.9981 26 35.9981C25.6705 35.9981 25.3461 36.0795 25.0556 36.2351C24.7651 36.3907 24.5176 36.6157 24.335 36.89L19.1225 44.7125L16.6825 40.9175C16.5015 40.6357 16.2525 40.4039 15.9585 40.2434C15.6646 40.0829 15.335 39.9988 15 39.9988C14.6651 39.9988 14.3355 40.0829 14.0416 40.2434C13.7476 40.4039 13.4986 40.6357 13.3175 40.9175L4.31754 54.9175C4.12305 55.2197 4.01356 55.5686 4.00057 55.9277C3.98759 56.2868 4.07159 56.6428 4.24375 56.9582C4.41591 57.2736 4.66986 57.5368 4.97892 57.7201C5.28797 57.9035 5.64071 58.0001 6.00004 58H38C38.3622 58.0002 38.7177 57.9021 39.0284 57.7161C39.3392 57.5301 39.5936 57.2633 39.7646 56.944C39.9355 56.6247 40.0165 56.265 39.999 55.9032C39.9815 55.5415 39.8661 55.1913 39.665 54.89L27.665 36.89ZM9.66254 54L15 45.6975L17.4075 49.4475C17.5871 49.727 17.8335 49.9574 18.1244 50.1179C18.4153 50.2783 18.7416 50.3638 19.0739 50.3665C19.4061 50.3692 19.7338 50.2892 20.0273 50.1335C20.3208 49.9779 20.5709 49.7515 20.755 49.475L26.005 41.6075L34.2625 54H9.66254ZM53.4125 20.585L39.4125 6.585C39.0378 6.21064 38.5298 6.00025 38 6H14C12.9392 6 11.9218 6.42143 11.1716 7.17157C10.4215 7.92172 10 8.93913 10 10V32C10 32.5304 10.2108 33.0391 10.5858 33.4142C10.9609 33.7893 11.4696 34 12 34C12.5305 34 13.0392 33.7893 13.4143 33.4142C13.7893 33.0391 14 32.5304 14 32V10H36V22C36 22.5304 36.2108 23.0391 36.5858 23.4142C36.9609 23.7893 37.4696 24 38 24H50V54H48C47.4696 54 46.9609 54.2107 46.5858 54.5858C46.2108 54.9609 46 55.4696 46 56C46 56.5304 46.2108 57.0391 46.5858 57.4142C46.9609 57.7893 47.4696 58 48 58H50C51.0609 58 52.0783 57.5786 52.8285 56.8284C53.5786 56.0783 54 55.0609 54 54V22C54.0003 21.7373 53.9487 21.4771 53.8483 21.2343C53.7479 20.9915 53.6007 20.7709 53.415 20.585H53.4125ZM40 12.8275L47.1725 20H40V12.8275Z" fill="#DBDBDB" />
                </svg>
              </div>

              <p className="mb-2 text-gray-600">Drag and drop file(s) here or select from device.</p>
              <p className="mb-4 text-sm text-gray-500">Size Limit: 3GB</p>

              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = 'image/*,video/*';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      handleFilesSelected(Array.from(files));
                    }
                  };
                  input.click();
                }}
                className="px-4 py-2 font-medium text-white transition-colors rounded-xl"
                style={{ backgroundColor: '#0091FF' }}
              >
                Add Media
              </button>
            </div>
          ) : (
            /* Uploaded Media Display */
            <div className="space-y-4">
              {/* Uploaded Media Thumbnails */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="overflow-hidden bg-gray-100 rounded-lg aspect-square">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="absolute flex items-center justify-center w-6 h-6 text-xs text-white transition-colors bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Add More Media Button */}
              <div className="inline-flex items-center gap-4 p-4 border border-gray-300 rounded-lg">
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = 'image/*,video/*';
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) {
                        handleFilesSelected(Array.from(files));
                      }
                    };
                    input.click();
                  }}
                  className="flex items-center gap-2 bg-[#F5FAFF] text-[#0081F1] font-medium rounded-lg border border-[#96C7F2] hover:bg-gray-200 transition-colors px-4 py-2"
                >
                  <UploadIcon className="w-4 h-4" />
                  Add Media
                </button>
                {uploadedFiles.length > 0 && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading || (userProfile?.user_type !== 'creator' && !selectedModelId)}
                    className="flex items-center gap-2 bg-[#0091FF] text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2"
                  >
                    {uploading ? 'Uploading...' : 'Upload Media'}
                  </button>
                )}
                {uploadedFiles.length > 0 && (
                  <button
                    onClick={() => setUploadedFiles([])}
                    className="flex items-center gap-2 px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Clear Files
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Bulk Upload Section */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="px-3 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Bulk Upload</h2>
            <div className="flex items-center gap-4">
              {selectedCount > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                </span>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchEdit}
                  disabled={selectedCount === 0 && uploadedFiles.length === 0}
                  className={`p-2 disabled:opacity-50 disabled:cursor-not-allowed ${(selectedCount > 0 || uploadedFiles.length > 0)
                      ? 'text-gray-600 hover:text-gray-800'
                      : 'text-gray-400 hover:text-gray-600'
                    }`}
                  title="Edit selected"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedCount === 0}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete selected"
                >
                  <DeleteIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleUpload}
                  disabled={selectedCount === 0 && uploadedFiles.length === 0}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${(selectedCount > 0 || uploadedFiles.length > 0) ? 'text-white' : 'text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  style={{
                    backgroundColor: (selectedCount > 0 || uploadedFiles.length > 0) ? '#0091FF' : undefined,
                    width: '127px',
                    height: '40px',
                    gap: '8px',
                    borderRadius: '12px',
                    paddingTop: '0px',
                    paddingRight: '16px',
                    paddingBottom: '0px',
                    paddingLeft: '16px'
                  }}
                  title="Upload selected"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left"><div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div></th>
                    <th className="px-4 py-3 text-left"><div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div></th>
                    <th className="px-4 py-3 text-left"><div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div></th>
                    <th className="px-4 py-3 text-left"><div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div></th>
                    <th className="px-4 py-3 text-left"><div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div></th>
                    <th className="px-4 py-3 text-left"><div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(6)].map((_, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3"><div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div></td>
                      <td className="px-4 py-3"><div className="w-12 h-12 bg-gray-300 rounded-lg animate-pulse"></div></td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div></td>
                      <td className="px-4 py-3"><div className="w-12 h-8 bg-gray-300 rounded animate-pulse"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <MediaDataTable 
              columns={createColumns(undefined, handleDelete, handleEdit)} 
              data={mediaItems}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
            />
          )}
        </div>
      </div>

      {/* Media Details Modal */}
      {/* <MediaDetailsModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        showSaveButton={true}
        onSave={() => {
          setShowMediaModal(false);
        }}
        details={selectedMediaItem ? {
          date: '20/12/2024',
          imageUrl: selectedMediaItem.imageUrl,
          category: [selectedMediaItem.category],
          hashtags: selectedMediaItem.hashtags.split(', '),
          caption: selectedMediaItem.caption,
          notes: selectedMediaItem.notes,
        } : null}
      /> */}

      {/* Batch Media Edit Modal */}
      <BatchMediaEditModal
        isOpen={showBatchEditModal}
        onClose={() => setShowBatchEditModal(false)}
        onSave={(data) => {
          setBatchEditData(data);
          setShowBatchEditModal(false);
          setShowConfirmBatchEdit(true);
        }}
        creators={creators}
      />

      {/* Confirm Batch Edit Modal */}
      <ConfirmBatchEditModal
        isOpen={showConfirmBatchEdit}
        onCancel={() => setShowConfirmBatchEdit(false)}
        onProceed={handleConfirmProceed}
      />

      {/* Upload Progress Toast */}
      <UploadProgressToast
        isOpen={showUploadToast}
        onClose={() => setShowUploadToast(false)}
        files={filesToUpload}
      />

      {/* Operation Progress Bar */}
      <OperationProgress
        isVisible={operationProgress.isVisible}
        title={operationProgress.title}
        progress={operationProgress.progress}
        total={operationProgress.total}
        status={operationProgress.status}
      />

      {/* Media Edit Modal */}
      <MediaEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingMediaItem(null);
        }}
        mediaItem={editingMediaItem}
        onSave={handleSaveEdit}
        models={models}
        creators={creators}
      />
    </div>
  );
};