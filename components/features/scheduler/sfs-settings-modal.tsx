"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { BlueSpinner } from "@/components/ui/spinners";

interface SFSSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: SFSSettingsData) => void;
}

interface SFSSettingsData {
  language: string;
  country: string;
  dateFormat: string;
  timeFormat: string;
  primaryTimeZone: string;
  timeSlot1: string;
  timeSlot2: string;
  timeSlot3: string;
  days: string[];
  smartMatch: boolean;
  max_sfs_per_day?: number;
  content_allowed?: string[];
  pin_content?: string;
  auto_approve?: boolean;
  smart_match_enabled?: boolean;
  posting_times?: Record<string, string>;
  timezone?: string;
}

// Cache for settings to avoid repeated API calls
let settingsCache: SFSSettingsData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const SFSSettingsModal: React.FC<SFSSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SFSSettingsData>({
    language: "English (UK)",
    country: "Poland (Polska)",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12-hour",
    primaryTimeZone: "(GMT +01:00) Central European Time",
    timeSlot1: "1:00pm",
    timeSlot2: "2:00pm",
    timeSlot3: "3:00pm",
    days: ["Tuesday", "Saturday", "Sunday"],
    smartMatch: true,
  });

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      // Check cache first - use cached data if available
      const now = Date.now();
      if (settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('⚡ Using cached settings (fast load)');
        setSettings(settingsCache);
        return;
      }

      setLoading(true);
      
      // Setup timeout for faster perceived performance
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/sfs-settings', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();
      
      if (data.data) {
        const newSettings: SFSSettingsData = {
          language: "English (UK)",
          country: "Poland (Polska)",
          dateFormat: "MM/DD/YYYY",
          timeFormat: "12-hour",
          primaryTimeZone: "(GMT +01:00) Central European Time",
          timeSlot1: data.data.time_slot_1 || "1:00pm",
          timeSlot2: data.data.time_slot_2 || "2:00pm",
          timeSlot3: data.data.time_slot_3 || "3:00pm",
          days: data.data.available_days || ["Tuesday", "Saturday", "Sunday"],
          smartMatch: true,
          max_sfs_per_day: data.data.max_sfs_per_day || 3,
          content_allowed: data.data.content_allowed || ['Fully Explicit', 'Topless', 'SFW Only'],
          pin_content: data.data.pin_content || 'Accept All',
          auto_approve: data.data.auto_approve || false,
          smart_match_enabled: data.data.smart_match_enabled || false,
          posting_times: data.data.posting_times || {},
          timezone: data.data.timezone || 'GMT+5',
        };
        
        setSettings(newSettings);
        
        // Cache the settings for future use
        settingsCache = newSettings;
        cacheTimestamp = now;
        
        console.log('✅ Settings loaded and cached');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⏱️ Request timeout - using default settings');
        toast.error('Settings load timed out. Using defaults.');
      } else {
        console.error('❌ Error loading settings:', error);
        toast.error('Failed to load settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof SFSSettingsData,
    value: string | boolean | string[]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDayToggle = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Build the request body
      const requestBody: any = {
        max_sfs_per_day: settings.max_sfs_per_day,
        content_allowed: settings.content_allowed,
        pin_content: settings.pin_content,
        auto_approve: settings.auto_approve,
        smart_match_enabled: settings.smartMatch,
        posting_times: settings.posting_times,
        timezone: settings.timezone,
        timeSlot1: settings.timeSlot1,
        timeSlot2: settings.timeSlot2,
        timeSlot3: settings.timeSlot3,
        days: settings.days,
      };
      
      const response = await fetch('/api/sfs-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to save settings');
      }

      const data = await response.json();
      console.log('✅ Settings saved:', data);
      
      // Update cache with new settings
      settingsCache = settings;
      cacheTimestamp = Date.now();
      
      toast.success('Settings saved successfully');
      onSave?.(settings);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      console.error('❌ Error saving settings:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const daysOfWeek = [
    { key: "Monday", label: "M" },
    { key: "Tuesday", label: "T" },
    { key: "Wednesday", label: "W" },
    { key: "Thursday", label: "T" },
    { key: "Friday", label: "F" },
    { key: "Saturday", label: "S" },
    { key: "Sunday", label: "S" },
  ];

  const languages = ["English (UK)", "English (US)", "Polish", "German", "French"];
  const countries = ["Poland (Polska)", "United Kingdom", "Germany", "France", "USA"];
  const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
  const timeFormats = ["12-hour", "24-hour"];
  const timeZones = [
    "(GMT +00:00) UTC",
    "(GMT +01:00) Central European Time",
    "(GMT +05:00) Pakistan Standard Time",
    "(GMT -05:00) Eastern Time (US & Canada)",
  ];
  const timeSlots = [
    "12:00am",
    "1:00am",
    "2:00am",
    "8:00am",
    "12:00pm",
    "1:00pm",
    "2:00pm",
    "3:00pm",
    "4:00pm",
    "5:00pm",
    "6:00pm",
    "9:00pm",
  ];

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              SFS Settings
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <BlueSpinner size="large" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-700">Loading your settings</p>
              <p className="text-xs text-gray-500">Please wait...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            SFS Settings
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Language and region */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">
              Language and region
            </h3>

            {/* Language */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => handleInputChange("language", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Country</Label>
              <Select
                value={settings.country}
                onValueChange={(value) => handleInputChange("country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Format */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Date Format</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value) => handleInputChange("dateFormat", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {dateFormats.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Format */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Time Format</Label>
              <Select
                value={settings.timeFormat}
                onValueChange={(value) => handleInputChange("timeFormat", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {timeFormats.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Primary time zone */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">
              Primary time zone
            </h3>
            <Select
              value={settings.primaryTimeZone}
              onValueChange={(value) => handleInputChange("primaryTimeZone", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time zone" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {timeZones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Availability</h3>

            {/* Time Slots */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((num) => (
                <div key={num} className="space-y-2">
                  <Label className="text-sm text-gray-700">
                    Time Slot {num}
                  </Label>
                  <Select
                    value={settings[`timeSlot${num}` as keyof SFSSettingsData] as string}
                    onValueChange={(value) =>
                      handleInputChange(`timeSlot${num}` as keyof SFSSettingsData, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Days</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => handleDayToggle(day.key)}
                    className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                      settings.days.includes(day.key)
                        ? "bg-[#EDF6FF] text-[#0091FF] border border-[#0091FF]"
                        : "bg-[#F8F8F8] text-gray-900 border border-[#E2E2E2] hover:bg-gray-50"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Match */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Smart Match</h3>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  handleInputChange("smartMatch", !settings.smartMatch)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.smartMatch ? "" : "bg-gray-200"
                }`}
                style={settings.smartMatch ? { backgroundColor: "#0091FF" } : {}}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.smartMatch ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-600">
              After allowing smart match you will get automatic matches for SFS
              daily.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 space-x-3 border-t">
          <Button variant="outline" onClick={onClose} color={"primary"} size={"small"}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            color={"primary"} 
            size={"small"} 
            variant={"solid"}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
