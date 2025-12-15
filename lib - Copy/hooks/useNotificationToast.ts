import { useEffect, useState } from 'react';
import { createClient } from '@/lib/utils/supabase/client';
import { Tables } from '@/types_db';

type Notification = Tables<'notifications'>;

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: string;
}

export const useNotificationToast = () => {
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          const toast: NotificationToast = {
            id: newNotification.id,
            title: newNotification.title,
            message: newNotification.message || '',
            type: newNotification.type,
          };
          setToasts((prev) => [...prev, toast]);

          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== newNotification.id));
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, removeToast };
};
