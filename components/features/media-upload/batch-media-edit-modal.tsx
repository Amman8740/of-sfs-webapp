"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';

interface BatchMediaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BatchEditData) => void;
  creators: Array<{ id: string; name: string; username: string }>;
}

interface BatchEditData {
  tag_creators: string[];
  category: string;
  hashtags: string[];
  caption: string;
  notes: string;
  is_public: boolean;
}

export const BatchMediaEditModal: React.FC<BatchMediaEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  creators
}) => {
  const [formData, setFormData] = useState<BatchEditData>({
    tag_creators: [],
    category: '',
    hashtags: [],
    caption: '',
    notes: '',
    is_public: false
  });

  const handleInputChange = (field: keyof BatchEditData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Batch Media Edit</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Form Fields */}
          <div className="space-y-4">
            {/* Caption */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Caption</label>
              <Input
                type="text"
                value={formData.caption}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                placeholder="Enter caption"
                className="w-full"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Enter category"
                className="w-full"
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Hashtags</label>
              <div className="w-full">
                <div className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <div className="flex flex-wrap items-center gap-1">
                    {formData.hashtags.map((hashtag, index) => {
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
                            onClick={() => {
                              const newHashtags = formData.hashtags.filter((_, i) => i !== index);
                              handleInputChange('hashtags', newHashtags);
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
                    <input
                      type="text"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
                          e.preventDefault();
                          const newHashtag = e.currentTarget.value.trim();
                          if (newHashtag) {
                            const formattedHashtag = newHashtag.startsWith('#') ? newHashtag : '#' + newHashtag;
                            const currentHashtags = [...formData.hashtags, formattedHashtag.replace('#', '')];
                            handleInputChange('hashtags', currentHashtags);
                            e.currentTarget.value = '';
                          } else {
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                      placeholder={formData.hashtags.length ? "" : "Type hashtags (press comma, space, or Enter to add)"}
                      className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                      style={{ border: 'none', boxShadow: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tag Creators */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Tag Creators</label>
              <MultiSelect
                value={formData.tag_creators}
                onChange={(value) => handleInputChange('tag_creators', value)}
                options={creators.map(creator => ({
                  value: creator.name || creator.username,
                  label: creator.name || creator.username
                }))}
                placeholder="Select creators to tag"
                className="w-full"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Notes</label>
              <Input
                type="text"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter notes"
                className="w-full"
              />
            </div>

            {/* Is Public */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.is_public}
                onChange={(e) => handleInputChange('is_public', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Make this media public
              </label>
            </div>

            {/* Warning Message */}
            <div className="flex items-start gap-3 p-4 border border-red-200 rounded-lg bg-red-50">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">
                These changes will replace all existing information for all selected media.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            color="gray"
            size="medium"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            color="primary"
            size="medium"
            variant="solid"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
