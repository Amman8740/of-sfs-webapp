"use client";

import React, { useState } from 'react';
import { ScheduleNewSFSModal } from './schedule-new-sfs-modal';

// Test component to verify the modal works
export const TestModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (data: any) => {
    console.log('Modal submitted with data:', data);
    alert('Modal submitted successfully! Check console for data.');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Schedule New SFS Modal</h1>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-white rounded transition-colors"
        style={{ backgroundColor: '#0091FF' }}
      >
        Open Schedule New SFS Modal
      </button>
      
      <ScheduleNewSFSModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
