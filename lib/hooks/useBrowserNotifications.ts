import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/client';
import { Tables } from '@/types_db';

type Notification = Tables<'notifications'>;

export const useBrowserNotifications = () => {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [isSupported, setIsSupported] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Check if browser supports notifications
  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission as any);
    }
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    if (!isSupported) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      setPermission('denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission as any);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Listen for new notifications and show browser notifications
  useEffect(() => {
    if (!isSupported || permission !== 'granted') return;

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
          const notification = payload.new as Notification;
          
          // Show browser notification
          const browserNotification = new Notification(notification.title, {
            body: notification.message || '',
            icon: '/logo.png', // Add your logo path
            badge: '/badge.png', // Add your badge icon path
            tag: notification.id, // Prevent duplicates
            requireInteraction: false,
          });

          // Handle click on notification
          browserNotification.onclick = (event) => {
            event.preventDefault();
            window.focus();

            // Navigate based on notification type
            if (notification.action_url) {
              router.push(notification.action_url);
            }

            // Close the notification
            browserNotification.close();
          };

          console.log('📢 Browser notification shown:', notification.title);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupported, permission, supabase, router]);

  return {
    isSupported,
    permission,
    requestPermission,
  };
};
