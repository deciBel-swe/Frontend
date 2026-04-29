import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/useAuth';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { NotificationDTO } from '@/types/notification';

/**
 * useNotifications Hook
 *
 * Real-time notification management for the current user.
 *
 * Features:
 * - Real-time notification streaming from Firebase
 * - Automatic sorting (newest first)
 * - Complete lifecycle management (loading, error states)
 *
 * The hook automatically:
 * - Connects to Firebase for real-time notification updates
 * - Handles connection cleanup on unmount or user change
 * - Provides error object with detailed error information
 * - Respects user notification preferences set via settings
 *
 * Note: This hook provides real-time stream. For paginated fetch, use notificationService.getNotifications().
 *
 * @returns Object with notifications, getNotifications method, and loading/error states
 *
 * @example
 * const { notifications, isLoading, error } = useNotifications();
 *
 * if (isLoading) return <Loading />;
 * if (isError) return <Error message={error?.message} />;
 *
 * return <NotificationList notifications={notifications} />;
 */
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
