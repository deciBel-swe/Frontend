import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth/useAuth';
import { normalizeApiError } from '@/hooks/useAPI';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';

/**
 * useMarkAllAsRead Hook
 *
 * Mutation hook for marking all notifications as read.
 *
 * Features:
 * - Marks all unread notifications as read in Firestore
 * - Loading, error, and success state tracking
 * - Throws error on failure for error handling in UI
 *
 * The hook requires user to be authenticated. Will throw an error if called when not logged in.
 *
 * @returns Object with markAllAsRead function, loading state, error, and success flag
 *
 * @example
 * const { markAllAsRead, isLoading, isError, error } = useMarkAllAsRead();
 *
 * const handleClear = async () => {
 *   try {
 *     await markAllAsRead();
 *     console.log('All notifications marked as read');
 *   } catch (err) {
 *     console.error('Failed to mark as read:', error?.message);
 *   }
 * };
 *
 * return <button onClick={handleClear} disabled={isLoading}>Clear</button>;
 */
export function useMarkAllAsRead() {
  const { user } = useAuth();
  const [hasMarkedAllAsRead, setHasMarkedAllAsRead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const markAllAsRead = useCallback(async () => {
    if (!user) {
      throw new Error('Must be logged in to mark notifications as read.');
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      await notificationService.markAllAsRead(user.id);
      setHasMarkedAllAsRead(true);
    } catch (caughtError) {
      const normalizedError = normalizeApiError(caughtError);
      setIsError(true);
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    hasMarkedAllAsRead,
    markAllAsRead,
    isLoading,
    isError,
    error,
  };
}
