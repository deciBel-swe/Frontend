'use client';

import { useEffect, useState, useMemo } from 'react';
import { notificationService } from '@/services/api/notificationService';
import { useAuth } from '@/features/auth/useAuth';
import type { NotificationDTO } from '@/types/notification';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (data) => {
        setNotifications(data);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const markAllAsRead = async () => {
    if (!user?.id) return;
    await notificationService.markAllAsRead(user.id);
  };

  return { notifications, unreadCount, isLoading, error, markAllAsRead };
}
