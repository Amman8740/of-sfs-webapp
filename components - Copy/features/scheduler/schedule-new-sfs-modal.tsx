"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, PlusIcon } from '@/components/ui/icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DateTimePickerModal } from './date-time-picker-modal';
import { ModelSelectDropdown } from './model-select-dropdown';
import { useScheduleSFS } from './hooks/use-schedule-sfs';
import { toast } from 'sonner';

interface ScheduleNewSFSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ScheduleNewSFSData) => void;
}

interface ScheduleNewSFSData {
  modelBeingPromoted: string;
  modelPromoting: string;
  dateTime: string;
  media: File | null;
  caption: string;
  promoLink: string;
}

export const ScheduleNewSFSModal: React.FC<ScheduleNewSFSModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const {
    loading,
    submitting,
    agencyModelOptions,
    allModelOptions,
    promoLinkOptions,
    scheduledDates,
    submitSFS,
  } = useScheduleSFS();

  const [formData, setFormData] = useState<ScheduleNewSFSData>({
    modelBeingPromoted: '',
    modelPromoting: '',
    dateTime: '',
    media: null,
    caption: '',
    promoLink: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (field: keyof ScheduleNewSFSData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setFormData(prev => ({ ...prev, media: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitSFS(formData);
    if (result.success) {
      // Don't show toast here - let parent component handle it
      setFormData({
        modelBeingPromoted: '',
        modelPromoting: '',
        dateTime: '',
        media: null,
        caption: '',
        promoLink: '',
      });
      onSubmit?.(formData);
      onClose();
    } else {
      toast.error('Failed to schedule SFS. Please try again.');
      console.error('Failed to submit:', result.error);
    }
  };

  const handleDatePickerToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDatePicker(!showDatePicker);
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    const formattedDateTime = `${date} (${time})`;
    setFormData(prev => ({ ...prev, dateTime: formattedDateTime }));
    setShowDatePicker(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>Schedule new SFS</DialogTitle>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <div className="flex-1 px-6 overflow-y-auto">
          <form id="schedule-sfs-form" onSubmit={handleSubmit} className="pb-4 space-y-4">
            {/* Model Being Promoted */}
            <div className="space-y-2">
              <Label htmlFor="modelBeingPromoted" className="text-sm font-medium text-gray-700">
                Model Being Promoted
              </Label>
              <ModelSelectDropdown
                value={formData.modelBeingPromoted}
                onChange={(value) => handleInputChange('modelBeingPromoted', value)}
                options={agencyModelOptions}
                placeholder="Select agency model"
                disabled={loading}
              />
            </div>

            {/* Model Promoting */}
            <div className="space-y-2">
              <Label htmlFor="modelPromoting" className="text-sm font-medium text-gray-700">
                Model Promoting
              </Label>
              <ModelSelectDropdown
                value={formData.modelPromoting}
                onChange={(value) => handleInputChange('modelPromoting', value)}
                options={allModelOptions}
                placeholder="Select promoting model"
                disabled={loading}
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-2">
              <Label htmlFor="dateTime" className="text-sm font-medium text-gray-700">
                Date & Time
              </Label>
              <div className="relative">
                <Input
                  id="dateTime"
                  value={formData.dateTime}
                  readOnly
                  className="pr-10 cursor-pointer"
                  placeholder="Set Date & Time"
                  onClick={handleDatePickerToggle}
                />
                <button
                  type="button"
                  onClick={handleDatePickerToggle}
                  className="absolute transform -translate-y-1/2 right-3 top-1/2"
                >
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Media */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Media</Label>
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="object-cover w-full h-48 rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, media: null }));
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }
                    }}
                    className="absolute flex items-center justify-center w-6 h-6 text-xs text-white bg-red-500 rounded-full top-2 right-2"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400">
                  <input
                    type="file"
                    id="media-upload"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="media-upload"
                    className="flex flex-col items-center space-y-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                      <PlusIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-500">Add Media</span>
                  </label>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-sm font-medium text-gray-700">
                Caption
              </Label>
              <Input
                id="caption"
                value={formData.caption}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                placeholder="Enter"
              />
            </div>

            {/* Promo Link */}
            <div className="space-y-2">
              <Label htmlFor="promoLink" className="text-sm font-medium text-gray-700">
                Promo Link
              </Label>
              <ModelSelectDropdown
                value={formData.promoLink}
                onChange={(value) => handleInputChange('promoLink', value)}
                options={promoLinkOptions}
                placeholder="Select promo link"
                disabled={loading}
              />
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            color="gray"
            size="medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="schedule-sfs-form"
            color="gray"
            size="medium"
            variant="solid"
            disabled={submitting}
            style={{ backgroundColor: '#0091FF' }}
          >
            {submitting ? 'Scheduling...' : 'Add'}
          </Button>
        </DialogFooter>

        {/* Date Time Picker Modal */}
        <DateTimePickerModal
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelect={handleDateTimeSelect}
          initialDate={new Date().toISOString().split('T')[0]}
          initialTime={new Date().toTimeString().slice(0, 5)}
          disabledDates={scheduledDates}
        />
      </DialogContent>
    </Dialog>
  );
};
