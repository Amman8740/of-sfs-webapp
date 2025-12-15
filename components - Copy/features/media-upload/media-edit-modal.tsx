"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Tables } from '@/types_db';
import { toast } from 'sonner';

type MediaItem = Tables<'media_items'>;

interface MediaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem: MediaItem | null;
  onSave: (updatedMedia: Partial<MediaItem>) => void;
  models: Array<{ id: string; name: string; username: string }>;
  creators: Array<{ id: string; name: string; username: string }>;
}

export const MediaEditModal: React.FC<MediaEditModalProps> = ({
  isOpen,
  onClose,
  mediaItem,
  onSave,
  models,
  creators,
}) => {
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [currentHashtagInput, setCurrentHashtagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCreatorNames, setSelectedCreatorNames] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCaption('');
      setCategory('');
      setHashtags('');
      setCurrentHashtagInput('');
      setNotes('');
      setSelectedCreatorNames([]);
      setIsPublic(false);
      setLoading(false);
      setNewImageFile(null);
      setImagePreviewUrl(null);
    }
  }, [isOpen]);
  useEffect(() => {
    if (mediaItem) {
      setCaption(mediaItem.caption || '');
      setCategory(mediaItem.category || '');
      // Handle hashtags - convert array to comma-separated string
      const hashtagValue = Array.isArray(mediaItem.hashtags) 
        ? mediaItem.hashtags.join(', ') 
        : (typeof mediaItem.hashtags === 'string' ? mediaItem.hashtags : '');
      setHashtags(hashtagValue);
      setNotes(mediaItem.notes || '');
      // tag_creators are now stored as names, not IDs
      const tagCreatorNames = Array.isArray(mediaItem.tag_creators) 
        ? mediaItem.tag_creators.filter((item): item is string => typeof item === 'string')
        : [];
      setSelectedCreatorNames(tagCreatorNames);
      setIsPublic(mediaItem.is_public || false);
      // Clear image preview when loading new media item
      setImagePreviewUrl(null);
      setNewImageFile(null);
    }
  }, [mediaItem, creators]);

  const handleSave = async () => {
    if (!mediaItem) return;

    setLoading(true);
    try {
      const updatedData = {
        caption: caption.trim(),
        category: category.trim(),
        hashtags: hashtags.split(',').map(h => h.trim()).filter(h => h),
        notes: notes.trim(),
        tag_creators: selectedCreatorNames,
        is_public: isPublic,
        newImageFile: newImageFile,
      };

      await onSave(updatedData);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error("Update failed", {
        description: error instanceof Error ? error.message : "Failed to update the media item.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      const newHashtag = currentHashtagInput.trim();
      if (newHashtag) {
        const formattedHashtag = newHashtag.startsWith('#') ? newHashtag : '#' + newHashtag;
        const currentHashtags = hashtags ? `${hashtags}, ${formattedHashtag}` : formattedHashtag;
        setHashtags(currentHashtags);
        setCurrentHashtagInput('');
      } else {
        setCurrentHashtagInput('');
      }
    } else if (e.key === 'Backspace' && currentHashtagInput === '' && hashtags.includes(',')) {
      const hashtagArray = hashtags.split(',');
      hashtagArray.pop();
      setHashtags(hashtagArray.join(',').trim());
    }
  };

  const removeHashtag = (index: number) => {
    const currentHashtags = hashtags.split(',');
    const newHashtags = currentHashtags.filter((_, i) => i !== index).join(',').trim();
    setHashtags(newHashtags);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/avi'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: `File type '${file.type}' is not supported. Please select: ${allowedTypes.join(', ')}`,
        });
        return;
      }

      // Validate file size (3GB limit)
      const maxFileSize = 3 * 1024 * 1024 * 1024; // 3GB
      if (file.size > maxFileSize) {
        toast.error("File too large", {
          description: "File size must be less than 3GB",
        });
        return;
      }

      setNewImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }
  };

  if (!isOpen || !mediaItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[900px] w-full max-h-[90vh] p-0 gap-0 overflow-hidden py-3"
      >
        <div className="relative flex w-full h-full">
          {/* Left: Edit Form Drawer */}
          <div className="w-[320px] border-r border-gray-200 bg-white flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Edit Media</h3>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
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
                  <div className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <div className="flex flex-wrap items-center gap-1">
                      {hashtags.split(',').map((hashtag, index) => {
                        const trimmedHashtag = hashtag.trim();
                        if (!trimmedHashtag) return null;

                        const displayHashtag = trimmedHashtag.startsWith('#') ? trimmedHashtag : `#${trimmedHashtag}`;

                        return (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 border border-blue-200 rounded-md"
                          >
                            {displayHashtag}
                            <button
                              type="button"
                              onClick={() => removeHashtag(index)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        );
                      })}
                      <input
                        type="text"
                        value={currentHashtagInput}
                        onChange={(e) => setCurrentHashtagInput(e.target.value)}
                        onKeyDown={handleHashtagKeyDown}
                        placeholder={hashtags ? "" : "Type hashtags (press comma, space, or Enter to add)"}
                        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                        style={{ border: 'none', boxShadow: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Tag Creators</label>
                <MultiSelect
                  value={selectedCreatorNames}
                  onChange={setSelectedCreatorNames}
                  options={creators.map(creator => ({
                    value: creator.name || creator.username,
                    label: creator.name || creator.username
                  }))}
                  placeholder="Select creators to tag"
                  className="w-full"
                />
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

            </div>


            {/* Action Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex items-center justify-start gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  color="gray"
                  size="medium"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="solid"
                  color="primary"
                  size="medium"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Media Preview */}
          <div className="relative flex items-center justify-center flex-1 overflow-hidden bg-gray-100">
            <div className="relative w-full h-full max-w-[500px] max-h-[500px]">
              <Image
                src={imagePreviewUrl || mediaItem?.file_url || mediaItem?.thumbnail_url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=face"}
                alt="Media preview"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              
              {/* Change Image Overlay */}
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black bg-opacity-0 hover:bg-opacity-30 group">
                <label className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 transform translate-y-4 bg-white rounded-lg shadow-lg cursor-pointer bg-opacity-90 hover:bg-opacity-100 group-hover:translate-y-0">
                  Change Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/avi"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};