"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PostFlaggedModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export const PostFlaggedModal: React.FC<PostFlaggedModalProps> = ({ 
  isOpen, 
  onClose,
  position = { x: 0, y: 0 }
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[300px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-gray-900">Post Flagged</DialogTitle>
          <DialogDescription className="text-xs text-gray-700 leading-relaxed">
            This post was flagged because it may have violated platform guidelines, contained prohibited content, or did not meet the agreed SFS terms such as incorrect format, missing tags, or posting outside the scheduled time.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
