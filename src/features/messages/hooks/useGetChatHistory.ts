import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { messageService } from '@/services';
import type { PaginationParams } from '@/services/api/messageService';
import type { ApiErrorDTO } from '@/types';
import type { PaginatedMessageResponse } from '@/types/message';

export function useGetChatHistory(
  userId: number | null | undefined,
  params?: PaginationParams
) {
  const [chatHistory, setChatHistory] =
    useState<PaginatedMessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(
    typeof userId === 'number' && Number.isFinite(userId)
  );
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const page = params?.page;
  const size = params?.size;

  const getChatHistory = useCallback(
    async (overrideParams?: PaginationParams) => {
      if (typeof userId !== 'number' || !Number.isFinite(userId)) {
        setChatHistory(null);
        setIsLoading(false);
        setIsError(false);
        setError(null);
        return null;
      }

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const response = await messageService.getChatHistory(
          userId,
          overrideParams ?? { page, size }
        );
        setChatHistory(response);
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
    [page, size, userId]
  );

  useEffect(() => {
    void getChatHistory();
  }, [getChatHistory]);

  return {
    chatHistory,
    getChatHistory,
    isLoading,
    isError,
    error,
  };
}
