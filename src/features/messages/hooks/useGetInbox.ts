import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { messageService } from '@/services';
import type { PaginationParams } from '@/services/api/messageService';
import type { ApiErrorDTO } from '@/types';
import type { PaginatedMessageResponse } from '@/types/message';

export function useGetInbox(params?: PaginationParams) {
  const [inbox, setInbox] = useState<PaginatedMessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const page = params?.page;
  const size = params?.size;

  const getInbox = useCallback(
    async (overrideParams?: PaginationParams) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const response = await messageService.getInbox(
          overrideParams ?? { page, size }
        );
        setInbox(response);
        return response;
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
    void getInbox();
  }, [getInbox]);

  return {
    inbox,
    getInbox,
    isLoading,
    isError,
    error,
  };
}
