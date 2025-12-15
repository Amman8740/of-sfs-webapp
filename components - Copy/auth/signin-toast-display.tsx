'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Toast } from '@/components/ui/toaster';

export function SignInToastDisplay() {
  const searchParams = useSearchParams();
  const [toasts, setToasts] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: string;
  }>>([]);

  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const status = searchParams.get('status');
    const statusDescription = searchParams.get('status_description');

    const newToasts: Array<{ id: string; title: string; message: string; type: string }> = [];

    if (error) {
      newToasts.push({
        id: `error-${Date.now()}`,
        title: error,
        message: errorDescription || '',
        type: 'error',
      });
    }

    if (status) {
      newToasts.push({
        id: `status-${Date.now()}`,
        title: status,
        message: statusDescription || '',
        type: 'success',
      });
    }

    if (newToasts.length > 0) {
      setToasts(newToasts);

      // Auto-close toast after 5 seconds
      const timer = setTimeout(() => {
        setToasts([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleCloseToast = (id: string) => {
    setToasts(toasts.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      ))}
    </div>
  );
}
