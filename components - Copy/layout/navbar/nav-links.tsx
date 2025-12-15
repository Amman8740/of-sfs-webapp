'use client';

import { useRouter } from 'next/navigation';
import { Logo, UserIcon } from '@/components/ui';
import { Tables } from '@/types_db';
import { Bell } from 'lucide-react';
import { useRealtimeNotifications } from '@/lib/hooks/useRealtimeNotifications';

type User = Tables<'users'>
interface NavLinksProps {
  user?: User | null;
}

export const NavLinks = ({ user }: NavLinksProps) => {
  const router = useRouter();
  const { notifications } = useRealtimeNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleProfileClick = () => {
    router.push('/account');
  };

  const handleNotificationsClick = () => {
    router.push('/notifications');
  };

  return (
    <nav className='fixed top-0 left-0 right-0 z-40 w-full h-16 bg-white border-gray-200 text-default-fg'>
      <div className='w-full px-6 py-3.5'>
        <div className='flex items-center justify-between w-full'>
          {/* Logo on the left */}
          <div className='flex items-center'>
            <Logo />
          </div>
          
          {/* User info on the right */}
          {user && (
            <div className='flex items-center gap-4'>
              {/* <button
                onClick={handleNotificationsClick}
                className='relative transition-opacity cursor-pointer hover:opacity-80'
              >
                <Bell size={20} className='text-canvas-text-contrast' />
                {unreadCount > 0 && (
                  <span className='absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button> */}
              <button
                onClick={handleProfileClick}
                className='flex items-center gap-3 transition-opacity cursor-pointer hover:opacity-80'
              >
                <div className='w-8 h-8'>
                  <UserIcon />
                </div>
                <span className='text-sm font-medium text-canvas-text-contrast'>
                  {user.full_name || user.email || 'User'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
