'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon } from '@/components/ui/icons';
import { createClient } from '@/lib/utils/supabase/client';

interface NewPromoLinkData {
  model_id?: string;
  promoName: string;
  url: string;
  description?: string;
  platform: string;
}

interface NewPromoLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewPromoLinkData) => void;
}

export const NewPromoLinkModal: React.FC<NewPromoLinkModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [modelOptions, setModelOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      // Get current logged-in user
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) return;

      // Fetch models belonging to this agency
      const { data: models } = await supabase
        .from('models')
        .select('id, name')
        .eq('agency_id', user.id);

      setModelOptions(
        (models || []).map((m: { id: string; name: string }) => ({
          value: m.id,
          label: m.name
        }))
      );
    };

    if (isOpen) load();
  }, [isOpen]);

  const [formData, setFormData] = useState<NewPromoLinkData>({
    model_id: '',
    promoName: '',
    url: '',
    description: '',
    platform: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const handleInputChange = (field: keyof NewPromoLinkData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleModelSelect = (modelValue: string) => {
    handleInputChange('model_id', modelValue);
    setIsModelDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.model_id ||
      !formData.promoName.trim() ||
      !formData.url.trim() ||
      !formData.platform
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        model_id: '',
        promoName: '',
        url: '',
        description: '',
        platform: ''
      });
    } catch (error) {
      console.error('Error creating promo link:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const selectedModel = modelOptions.find(
    (option) => option.value === formData.model_id
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Promo Link</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form
          id="promo-link-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-900 flex items-center justify-between"
                style={{
                  outlineColor: '#0091FF'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0091FF';
                  e.target.style.boxShadow = '0 0 0 2px rgba(0, 145, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <span
                  className={selectedModel ? 'text-gray-900' : 'text-gray-500'}
                >
                  {selectedModel ? selectedModel.label : 'Select a model'}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-canvas-base w-full"
                align="start"
              >
                {modelOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleModelSelect(option.value)}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Promo Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promo Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.promoName}
              onChange={(e) => handleInputChange('promoName', e.target.value)}
              placeholder="e.g., July Free Trial Blast"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{
                outlineColor: '#0091FF'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0091FF';
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 145, 255, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promo Link URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://www.onlufans.com/..."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{
                outlineColor: '#0091FF'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0091FF';
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 145, 255, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform <span className="text-red-500">*</span>
            </label>

            <select
              value={formData.platform}
              onChange={(e) => handleInputChange('platform', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
            >
              <option value="">Select platform</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Reddit">Reddit</option>
              <option value="Twitter">Twitter</option>
              <option value="Paid Ads">Paid Ads</option>
              <option value="Telegram">Telegram</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add a description for this promo link..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
              style={{
                outlineColor: '#0091FF'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0091FF';
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 145, 255, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </form>

        <DialogFooter>
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
            form="promo-link-form"
            disabled={
              isSubmitting ||
              !formData.model_id ||
              !formData.promoName.trim() ||
              !formData.url.trim() ||
              !formData.platform
            }
            variant="solid"
            color="gray"
            size="medium"
            style={{ backgroundColor: '#0091FF' }}
          >
            {isSubmitting ? 'Creating...' : 'Create Promo Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
