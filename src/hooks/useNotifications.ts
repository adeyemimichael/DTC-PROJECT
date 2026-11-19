'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  related_table: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const json = await res.json();
      setNotifications(json.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic local update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      if (!res.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      // Revert if needed or silent fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic local update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
      });
      if (!res.ok) {
        throw new Error('Failed to mark all as read');
      }
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
