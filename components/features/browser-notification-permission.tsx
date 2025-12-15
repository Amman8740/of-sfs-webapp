'use client';

import React, { useEffect, useState } from 'react';
import { useBrowserNotifications } from '@/lib/hooks/useBrowserNotifications';
import { Bell } from 'lucide-react';

export function BrowserNotificationPermission() {
  const { isSupported, permission, requestPermission } = useBrowserNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isSupported || permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {!showPrompt ? (
        <button
          onClick={() => setShowPrompt(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Bell size={18} />
          Enable Notifications
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-3">
          <p className="text-sm font-medium text-gray-900">
            Get instant notifications for new requests and updates
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await requestPermission();
                setShowPrompt(false);
              }}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Enable
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 text-sm rounded hover:bg-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
