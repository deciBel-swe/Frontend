import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth/useAuth';
import { normalizeApiError } from '@/hooks/useAPI';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';

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
