import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/useAuth';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { UnreadCountResponse } from '@/types/notification';

/**
 * useUnreadCount Hook
 *
 * Fetches and tracks the unread notification count for the current user.
 *
 * Features:
 * - Quick query for unread notification count
 * - Useful for UI badges
 * - Complete lifecycle management (loading, error states)
 * - Can be manually refetched via getUnreadCount()
 *
 * The hook:
 * - Fetches count on mount and when user changes
 * - Provides both the count and full response object
 * - Can be manually called to refresh
 * - Does NOT provide real-time updates (for that, use useUnreadCountRealtime if available)
 *
 * @returns Object with unread count, response object, getUnreadCount method, and loading/error states
 *
 * @example
 * const { unreadCount, getUnreadCount, isLoading, error } = useUnreadCount();
 *
 * return (
 *   <>
 *     <NotificationBell count={unreadCount} onClick={() => getUnreadCount()} />
 *     {error && <Error message={error.message} />}
 *   </>
 * );
 */
export function useUnreadCount() {
  const { user } = useAuth();
  const [unreadCountResponse, setUnreadCountResponse] =
    useState<UnreadCountResponse>({ unreadCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const getUnreadCount = useCallback(async () => {
    if (!user?.id) {
      return 0;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await notificationService.getUnreadCount();
      setUnreadCountResponse(result);
      return result.unreadCount;
    } catch (caughtError) {
      const normalizedError =
        caughtError instanceof Error
          ? {
              statusCode: 500,
              message: caughtError.message,
            }
          : {
              statusCode: 500,
              message: 'Failed to load unread count.',
            };
      setIsError(true);
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCountResponse({ unreadCount: 0 });
      setIsLoading(false);
      return;
    }

    void getUnreadCount();
  }, [getUnreadCount, user?.id]);

  return {
    unreadCount: unreadCountResponse.unreadCount,
    unreadCountResponse,
    getUnreadCount,
    isLoading,
    isError,
    error,
  };
}
