"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreatorDetailsData {
  model: string;
  promoName: string;
  fans: number;
  matchCompatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  rules: {
    maxSfsPerDay: number;
    contentAllowed: Array<'Fully Explicit' | 'Topless' | 'SFW Only'>;
    pinContent: string;
  };
}

interface CreatorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: CreatorDetailsData | null;
}

export const CreatorDetailsModal: React.FC<CreatorDetailsModalProps> = ({ isOpen, onClose, details }) => {
  if (!details) return null;

  const getMatchBadgeClasses = (level: CreatorDetailsData['matchCompatibility']) => {
    const base = 'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium';
    switch (level) {
      case 'Excellent':
        return `${base} bg-green-100 text-green-700`;
      case 'Good':
        return `${base} bg-blue-100 text-blue-700`;
      case 'Average':
        return `${base} bg-yellow-100 text-yellow-800`;
      case 'Poor':
        return `${base} bg-red-100 text-red-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="fixed right-0 top-0 h-full max-h-screen w-full sm:max-w-md p-0 gap-0 translate-x-0 translate-y-0 rounded-none sm:rounded-l-xl border-l border-[#CFDAF1] data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right overflow-hidden"
        style={{
          left: 'auto',
          transform: 'none',
        }}
      >
        {/* Scrollable Content Wrapper */}
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <DialogHeader className="flex-shrink-0 p-6 pb-0">
            <DialogTitle className="text-xl font-semibold text-gray-900">Creator Details</DialogTitle>
          </DialogHeader>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-0">
              {/* Row: Model */}
              <div className="py-3 border-b border-gray-200">
                <div className="text-sm text-gray-500">Model</div>
                <div className="text-sm text-gray-900 mt-1">{details.model}</div>
              </div>

              {/* Row: Promo name */}
              <div className="py-3 border-b border-gray-200">
                <div className="text-sm text-gray-500">Promo name</div>
                <div className="text-sm text-gray-900 mt-1">{details.promoName}</div>
              </div>

              {/* Row: Fans */}
              <div className="py-3 border-b border-gray-200">
                <div className="text-sm text-gray-500">Fans</div>
                <div className="text-sm text-gray-900 mt-1">{details.fans.toLocaleString()}</div>
              </div>

              {/* Row: Match Compatibility */}
              <div className="py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Match Compatability</div>
                  <span className={getMatchBadgeClasses(details.matchCompatibility)}>{details.matchCompatibility}</span>
                </div>
              </div>

              {/* Rules Accordion (static open for now) */}
              <div className="pt-3">
                <div className="flex items-center justify-between text-gray-900 text-sm font-medium mb-2">
                  <span>Rules</span>
                  <span className="text-gray-400">^</span>
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="space-y-5">
                    <div>
                      <div className="text-sm text-gray-500">Max SFS Per Day</div>
                      <div className="text-sm text-gray-900 mt-2">{details.rules.maxSfsPerDay}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Content Allowed</div>
                      <div className="flex flex-col gap-3 mt-2">
                        {details.rules.contentAllowed.map((item) => (
                          <div key={item} className="text-sm text-gray-900">{item}</div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Pin Content</div>
                      <div className="text-sm text-gray-900 mt-2">{details.rules.pinContent}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
