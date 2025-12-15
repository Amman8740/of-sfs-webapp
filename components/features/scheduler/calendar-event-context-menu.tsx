"use client";

import React, { useRef, useEffect } from 'react';

interface CalendarEventContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  eventData?: {
    id: string;
    title: string;
    time: string;
    creator: string;
    mediaUrl: string;
  };
  onCreatorDetails: () => void;
  onMediaDetails: () => void;
}

export const CalendarEventContextMenu: React.FC<CalendarEventContextMenuProps> = ({
  isOpen,
  onClose,
  position,
  eventData,
  onCreatorDetails,
  onMediaDetails
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !eventData) return null;

  const handleCreatorDetails = () => {
    onCreatorDetails();
    onClose();
  };

  const handleMediaDetails = () => {
    onMediaDetails();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[180px]"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <button
        onClick={handleCreatorDetails}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        View creator details
      </button>
      <button
        onClick={handleMediaDetails}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        View media details
      </button>
    </div>
  );
};
