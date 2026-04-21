import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { UnreadCountResponse } from '@/types/notification';

export function useUnreadCount() {
  const [unreadCountResponse, setUnreadCountResponse] =
    useState<UnreadCountResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const getUnreadCount = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await notificationService.getUnreadCount();
      setUnreadCountResponse(result);
      return result;
    } catch (caughtError) {
      const normalizedError = normalizeApiError(caughtError);
      setIsError(true);
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void getUnreadCount();
  }, [getUnreadCount]);

  return {
    unreadCount: unreadCountResponse?.unreadCount ?? 0,
    unreadCountResponse,
    getUnreadCount,
    isLoading,
    isError,
    error,
  };
}
