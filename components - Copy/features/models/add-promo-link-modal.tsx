"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label } from '@/components/ui';

interface PromoLink {
  id: string;
  label: string;
  type: string;
  url: string;
}

interface AddPromoLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promoLink: Omit<PromoLink, 'id'>) => void;
}

export const AddPromoLinkModal: React.FC<AddPromoLinkModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = React.useState({
    label: '',
    type: '',
    url: ''
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (formData.label && formData.type && formData.url) {
      onSave(formData);
      setFormData({ label: '', type: '', url: '' });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ label: '', type: '', url: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] !bg-white border border-gray-200 shadow-lg">
        <DialogHeader className="text-left">
          <DialogTitle>Add new promo link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 bg-white">
          <div className="space-y-2">
            <Label htmlFor="label" className="text-left font-medium text-gray-900">
              Label
            </Label>
            <Input
              id="label"
              placeholder="Enter promo name"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type" className="text-left font-medium text-gray-900">
              Type
            </Label>
            <Input
              id="type"
              placeholder="Enter Type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url" className="text-left font-medium text-gray-900">
              URL
            </Label>
            <Input
              id="url"
              placeholder="Enter URL"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="bg-white justify-end mt-6">
          <Button 
            type="button" 
            variant="outline" 
            color="gray"
            size="medium"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="solid"
            color="primary"
            size="medium"
            onClick={handleSave}
            disabled={!formData.label || !formData.type || !formData.url}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
