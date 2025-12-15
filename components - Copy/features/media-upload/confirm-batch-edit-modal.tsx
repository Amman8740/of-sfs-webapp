"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmBatchEditModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onProceed: () => void;
}

export const ConfirmBatchEditModal: React.FC<ConfirmBatchEditModalProps> = ({
  isOpen,
  onCancel,
  onProceed,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Batch Media Edit</DialogTitle>
        </DialogHeader>
        
        <p className="text-sm text-gray-600">
          If you have Co-creators featured in your media, please tag them before uploading.
        </p>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
            color="gray"
            size="medium"
          >
            Cancel
          </Button>
          <Button 
            onClick={onProceed}
            color="primary"
            size="medium"
            variant="solid"
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


