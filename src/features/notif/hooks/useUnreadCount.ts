import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/features/auth/useAuth';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';

export function useUnreadCount() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<
    import('@/types/notification').NotificationDTO[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const getUnreadCount = useCallback(async () => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (result) => {
        setNotifications(result);
        setIsLoading(false);
      },
      (caughtError) => {
        setIsError(true);
        setError({
          statusCode: 500,
          message: caughtError.message || 'Failed to load unread count.',
          error: 'NOTIFICATION_SUBSCRIBE_FAILED',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  return {
    unreadCount,
    unreadCountResponse: { unreadCount },
    getUnreadCount,
    isLoading,
    isError,
    error,
  };
}
