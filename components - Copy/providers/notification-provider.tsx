'use client';

import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useNotificationToast } from '@/lib/hooks/useNotificationToast';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useNotificationToast();

  return (
    <>
      {children}
      <Toaster toasts={toasts} onClose={removeToast} />
    </>
  );
}
