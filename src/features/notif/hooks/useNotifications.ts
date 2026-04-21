import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { notificationService } from '@/services';
import type { PaginationParams } from '@/services/api/notificationService';
import type { ApiErrorDTO } from '@/types';
import type { NotificationsPage } from '@/types/notification';

export function useNotifications(params?: PaginationParams) {
  const [notifications, setNotifications] = useState<NotificationsPage | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const page = params?.page;
  const size = params?.size;

  const getNotifications = useCallback(
    async (overrideParams?: PaginationParams) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const result = await notificationService.getNotifications(
          overrideParams ?? { page, size }
        );
        setNotifications(result);
        return result;
      } catch (caughtError) {
        const normalizedError = normalizeApiError(caughtError);
        setIsError(true);
        setError(normalizedError);
        throw normalizedError;
      } finally {
        setIsLoading(false);
      }
    },
    [page, size]
  );

  useEffect(() => {
    void getNotifications();
  }, [getNotifications]);

  return {
    notifications,
    getNotifications,
    isLoading,
    isError,
    error,
  };
}
