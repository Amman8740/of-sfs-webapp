"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface SFSRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SFSRulesData) => void;
  initialData?: SFSRulesData;
  isLoading?: boolean;
}

interface SFSRulesData {
  maxSfsPerDay: number;
  contentAllowed: string[];
  massDM: boolean;
  pinContent: "Accept All" | "Accept Only";
  fanCount: string;
  contentType: string;
  otherContent?: string;
}

export const SFSRulesModal: React.FC<SFSRulesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
}) => {
  const [data, setData] = useState<SFSRulesData>(
    initialData || {
      maxSfsPerDay: 3,
      contentAllowed: [],
      massDM: false,
      pinContent: "Accept All",
      fanCount: "80%",
      contentType: "Topless",
    }
  );

  // Sync data when initialData changes
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleCheckboxChange = (content: string) => {
    setData((prev) => ({
      ...prev,
      contentAllowed: prev.contentAllowed.includes(content)
        ? prev.contentAllowed.filter((c) => c !== content)
        : [...prev.contentAllowed, content],
    }));
  };

  const handleSave = () => onSave(data);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        style={{
          width: "448px",
          height: "840px",
          background: "#F8F8F8",
          boxShadow: "0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A",
        }}
      >
        <DialogHeader>
          <DialogTitle>SFS Rules</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Max SFS Per Day */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Max SFS Per Day
            </label>
            <input
              type="number"
              value={data.maxSfsPerDay}
              onChange={(e) =>
                setData({ ...data, maxSfsPerDay: Number(e.target.value) })
              }
              placeholder="Enter Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Content Allowed */}
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Content Allowed
            </label>
            <div className="space-y-3">
              {[
                "Fully Explicit",
                "Topless",
                "SFW Only",
                "BG / Group Content",
                "Public Content",
              ].map((content) => (
                <label key={content} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.contentAllowed.includes(content)}
                    onChange={() => handleCheckboxChange(content)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{content}</span>
                </label>
              ))}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={!!data.otherContent}
                  onChange={(e) =>
                    setData({
                      ...data,
                      otherContent: e.target.checked ? "" : undefined,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Other:</span>
                <input
                  type="text"
                  value={data.otherContent || ""}
                  onChange={(e) =>
                    setData({ ...data, otherContent: e.target.value })
                  }
                  className="flex-1 px-2 py-1 ml-2 text-sm border-b border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter other content type"
                  disabled={!data.otherContent}
                />
              </div>
            </div>
          </div>

          {/* Mass DM */}
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Mass DM
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setData({ ...data, massDM: !data.massDM })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  data.massDM ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    data.massDM ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="ml-3 text-sm text-gray-700">
                {data.massDM ? "On" : "Off"}
              </span>
            </div>
          </div>

          {/* Pin Content */}
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Pin Content
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pinContent"
                  value="Accept All"
                  checked={data.pinContent === "Accept All"}
                  onChange={() => setData({ ...data, pinContent: "Accept All" })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Accept All</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="pinContent"
                  value="Accept Only"
                  checked={data.pinContent === "Accept Only"}
                  onChange={() => setData({ ...data, pinContent: "Accept Only" })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Accept Only</span>
              </label>

              {data.pinContent === "Accept Only" && (
                <div className="ml-6 space-y-3">
                  {/* Fan Count Select */}
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">
                      Fan Count
                    </label>
                    <Select
                      value={data.fanCount}
                      onValueChange={(val) => setData({ ...data, fanCount: val })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select fan count" />
                      </SelectTrigger>
                      <SelectContent>
                        {["50%", "60%", "70%", "80%", "90%", "100%"].map(
                          (val) => (
                            <SelectItem key={val} value={val}>
                              {val}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Content Type Select */}
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">
                      Content Type
                    </label>
                    <Select
                      value={data.contentType}
                      onValueChange={(val) =>
                        setData({ ...data, contentType: val })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Fully Explicit",
                          "Topless",
                          "SFW Only",
                          "BG / Group Content",
                          "Public Content",
                        ].map((val) => (
                          <SelectItem key={val} value={val}>
                            {val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button color="gray" variant="ghost" size="small" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button color="primary" variant="solid" size="small" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
