import { useCallback, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { MessageResponse } from '@/types/user';

export function useMarkAllAsRead() {
  const [markAllAsReadResponse, setMarkAllAsReadResponse] =
    useState<MessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const markAllAsRead = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await notificationService.markAllAsRead();
      setMarkAllAsReadResponse(result);
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

  return {
    markAllAsReadResponse,
    markAllAsRead,
    isLoading,
    isError,
    error,
  };
}
