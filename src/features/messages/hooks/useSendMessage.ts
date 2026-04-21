import { useCallback, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { messageService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { MessageDTO, SendMessageRequest } from '@/types/message';

export function useSendMessage() {
  const [sentMessage, setSentMessage] = useState<MessageDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const sendMessage = useCallback(
    async (userId: number, payload: SendMessageRequest) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const response = await messageService.sendMessage(userId, payload);
        setSentMessage(response);
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
    []
  );

  return {
    sentMessage,
    sendMessage,
    isLoading,
    isError,
    error,
  };
}
