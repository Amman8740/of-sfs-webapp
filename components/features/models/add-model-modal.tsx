"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { EditIcon } from '@/components/ui/icons';
import { createClient } from '@/lib/utils/supabase/client';
import { toast } from 'sonner';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (modelData: ModelFormData) => Promise<void>;
}

export interface ModelFormData {
  name: string;
  email: string;
  onlyfansLink: string;
  telegramLink: string;
  displayPictureUrl?: string;
  // Additional stats fields
  username?: string;
  price?: number;
  fanCount?: number;
  payoutPercentage?: number;
  subscriptionType?: 'Paid' | 'Free' | 'Trial';
  status?: 'Active' | 'Inactive' | 'Paused' | 'Suspended';
  language?: string;
  timezone?: string;
  isVerified?: boolean;
}

export const AddModelModal: React.FC<AddModelModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<ModelFormData>({
    name: '',
    email: '',
    onlyfansLink: '',
    telegramLink: '',
    displayPictureUrl: '',
    username: '',
    price: 0,
    fanCount: 0,
    payoutPercentage: 0,
    subscriptionType: 'Paid',
    status: 'Active',
    language: 'English',
    timezone: 'GMT+5',
    isVerified: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ModelFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    handleInputChange('displayPictureUrl', URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = formData.displayPictureUrl;
      if (selectedFile) {
        try {
          const supabase = createClient();
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `profiles/${fileName}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('models-profile-pictures')
            .upload(filePath, selectedFile, {
              cacheControl: '3600',
              upsert: false
            });
          if (uploadError) {
            console.error('Image upload failed:', uploadError);
            if (uploadError.message.includes('Bucket not found')) {
              toast.warning('Storage not configured', {
                description: "Image upload is not available yet. Creating model without image.",
              });
            } else {
              toast.warning('Upload warning', {
                description: `Image upload failed: ${uploadError.message}. Creating model without image.`,
              });
            }
            imageUrl = '';
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('models-profile-pictures')
              .getPublicUrl(filePath);
            imageUrl = publicUrl;
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          toast.warning('Upload warning', {
            description: "Image upload failed. Creating model without image.",
          });
          imageUrl = '';
        }
      }
      await onSubmit({ ...formData, displayPictureUrl: imageUrl || undefined });

      setFormData({
        name: '',
        email: '',
        onlyfansLink: '',
        telegramLink: '',
        displayPictureUrl: '',
        username: '',
        price: 0,
        fanCount: 0,
        payoutPercentage: 0,
        subscriptionType: 'Paid',
        status: 'Active',
        language: 'English',
        timezone: 'GMT+5',
        isVerified: false
      });
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error('Error submitting model:', error);
      toast.error('Failed to create model');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      onlyfansLink: '',
      telegramLink: '',
      displayPictureUrl: '',
      username: '',
      price: 0,
      fanCount: 0,
      payoutPercentage: 0,
      subscriptionType: 'Paid',
      status: 'Active',
      language: 'English',
      timezone: 'GMT+5',
      isVerified: false
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[448px] h-[90vh] overflow-y-auto gap-6">
        <DialogHeader>
          <DialogTitle>Add Model</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Picture Section */}
          <div className="space-y-3">
            <Label htmlFor="displayPicture">Display Picture</Label>
            <div className="flex items-center space-x-4">
              <div className="relative flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full">
                {formData.displayPictureUrl ? (
                  <img
                    src={formData.displayPictureUrl}
                    alt="Model display picture"
                    className="object-cover w-20 h-20 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                )}
                <label className="absolute bottom-0 right-0 flex items-center justify-center w-6 h-6 rounded-full cursor-pointer" style={{ backgroundColor: '#EDEDED' }}>
                  <EditIcon className="w-3 h-3 text-white"/>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
                </label>
              </div>
            </div>
          </div>

          {/* Model Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Model name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          {/* OnlyFans Link */}
          <div className="space-y-2">
            <Label htmlFor="onlyfansLink">OnlyFans account link</Label>
            <Input
              id="onlyfansLink"
              type="url"
              placeholder="Enter link"
              value={formData.onlyfansLink}
              onChange={(e) => handleInputChange('onlyfansLink', e.target.value)}
            />
          </div>

          {/* Telegram Link */}
          <div className="space-y-2">
            <Label htmlFor="telegramLink">Telegram account link</Label>
            <Input
              id="telegramLink"
              type="url"
              placeholder="Enter link"
              value={formData.telegramLink}
              onChange={(e) => handleInputChange('telegramLink', e.target.value)}
            />
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end pt-4 space-x-3">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              variant="outline"
              color="gray"
              size="medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="solid"
              color="gray"
              size="medium"
              style={{ backgroundColor: '#0091FF' }}
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
