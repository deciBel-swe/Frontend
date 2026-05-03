import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/useAuth';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { NotificationDTO } from '@/types/notification';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const getNotifications = useCallback(
    async () => notifications,
    [notifications]
  );

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
          message: caughtError.message || 'Failed to load notifications.',
          error: 'NOTIFICATION_SUBSCRIBE_FAILED',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  return {
    notifications,
    getNotifications,
    isLoading,
    isError,
    error,
  };
}
