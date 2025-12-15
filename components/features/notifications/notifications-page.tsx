"use client";

import React, { useState, useMemo } from 'react';
import { DeleteIcon } from '@/components/ui/icons';
import { Pagination } from '@/components/ui';
import { NotificationsDataTable } from './notifications-listing/notifications-table';
import { createColumns } from './notifications-listing/notifications-columns';
import { Tables } from '@/types_db';
import { useRealtimeNotifications } from '@/lib/hooks/useRealtimeNotifications';

export const NotificationsPage: React.FC = () => {
  type Notifications = Tables<'notifications'>;
  const { notifications, loading, markAsRead, deleteNotification } = useRealtimeNotifications();

  // Sort notifications: unread first, then by created_at descending
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      // Unread comes first
      if (a.is_read !== b.is_read) {
        return a.is_read ? 1 : -1;
      }
      // Then sort by created_at descending (newest first)
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [notifications]);

  const handleNotificationClick = (notification: Notifications) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const columns = createColumns(handleNotificationClick, handleDeleteNotification);

  const unreadCount = sortedNotifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 min-h-screen p-6 bg-[#FCFCFC] rounded-tl-xl">
      <div className="pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <p className="mt-1 text-sm text-gray-600">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
        )}
      </div>
      {loading ? (
        <div className="py-8 text-center">Loading notifications...</div>
      ) : sortedNotifications.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No notifications yet</div>
      ) : (
        <NotificationsDataTable columns={columns} data={sortedNotifications} />
      )}
    </div>
  );
};
