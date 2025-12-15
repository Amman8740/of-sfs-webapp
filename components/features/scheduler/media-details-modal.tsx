"use client";

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface MediaDetailsData {
  date?: string;
  imageUrl: string;
  creatorName?: string;
  category?: string[];
  hashtags?: string[];
  caption?: string;
  notes?: string;
}

interface MediaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: MediaDetailsData | null;
  showSaveButton?: boolean;
  onSave?: () => void;
}

// Reusable pill component
const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded-md">
    {children}
  </span>
);

export const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({ isOpen, onClose, details, showSaveButton = false, onSave }) => {
  if (!details) return null;

  // Check if this is a simple image-only view (no category, hashtags, etc.)
  const isSimpleView = (!details.category || details.category.length === 0) && 
                       (!details.hashtags || details.hashtags.length === 0) && 
                       !details.caption && !details.notes;

  if (isSimpleView) {
    // Simple modal - just image and creator name
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md gap-0 p-0 overflow-hidden bg-white">
          {/* Image Container */}
          <div className="relative flex items-center justify-center w-full bg-gray-100 aspect-square">
            {details.imageUrl.startsWith('http') ? (
              <img
                src={details.imageUrl}
                alt={details.creatorName || 'Media preview'}
                className="object-cover w-full h-full"
              />
            ) : (
              <Image
                src={details.imageUrl}
                alt={details.creatorName || 'Media preview'}
                fill
                className="object-cover"
                sizes="400px"
              />
            )}
          </div>

          {/* Creator Name Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">{details.creatorName || 'Unknown Creator'}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Original complex view - image with details panel
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[900px] w-full max-h-[90vh] p-0 gap-0 overflow-hidden"
      >
        <div className="relative flex w-full h-full max-h-[90vh]">
          {/* Left: Media details drawer */}
          <div className="w-[320px] border-r border-gray-200 bg-white flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Media details</h3>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* Category */}
              {details.category && details.category.length > 0 && (
                <div className="pb-4 space-y-2 border-b border-gray-200">
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="flex flex-wrap gap-2">
                    {details.category.map((c) => (
                      <Badge key={c} status="info" text={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {details.hashtags && details.hashtags.length > 0 && (
                <div className="pt-4 pb-4 space-y-2 border-b border-gray-200">
                  <div className="text-sm text-gray-500">Hashtags</div>
                  <div className="flex flex-wrap gap-2">
                    {details.hashtags.map((h) => (
                      <Badge key={h} status="info" text={h} />
                    ))}
                  </div>
                </div>
              )}

              {/* Caption */}
              {details.caption && (
                <div className="pt-4 pb-4 space-y-2 border-b border-gray-200">
                  <div className="text-sm text-gray-500">Caption</div>
                  <input
                    readOnly
                    value={details.caption || ''}
                    placeholder="This is a test caption"
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-md outline-none bg-gray-50"
                  />
                </div>
              )}

              {/* Notes */}
              {details.notes && (
                <div className="pt-4 space-y-2">
                  <div className="text-sm text-gray-500">Notes</div>
                  <textarea
                    readOnly
                    value={details.notes || ''}
                    placeholder="This is a test video"
                    rows={6}
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-md outline-none resize-none bg-gray-50"
                  />
                </div>
              )}
            </div>

            {/* Save Button - Fixed at bottom */}
            {showSaveButton && (
              <div className="flex-shrink-0 p-4 border-t border-gray-200">
                <button
                  onClick={onSave}
                  className="w-full font-medium text-white transition-colors rounded-xl"
                  style={{
                    backgroundColor: '#0091FF',
                    height: '40px',
                    borderRadius: '12px'
                  }}
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Right: Image preview */}
          <div className="relative flex-1 overflow-hidden bg-black flex items-center justify-center max-h-[90vh]">
            {/* Date badge */}
            {details.date && (
              <div className="absolute right-3 top-3 z-10 rounded-md bg-white/90 px-2 py-1 text-[10px] text-gray-800 shadow-sm">
                {details.date}
              </div>
            )}
            <div className="relative w-full h-full max-w-[500px] max-h-[500px] flex items-center justify-center">
              {details.imageUrl.startsWith('http') ? (
                <img
                  src={details.imageUrl}
                  alt={details.creatorName || 'Media preview'}
                  className="object-contain max-w-full max-h-full"
                />
              ) : (
                <Image
                  src={details.imageUrl}
                  alt={details.creatorName || 'Media preview'}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};