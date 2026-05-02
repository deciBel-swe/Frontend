import { useCallback, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { RegisterDeviceTokenRequest } from '@/types/notification';
import type { MessageResponse } from '@/types/user';

export function useRegisterDeviceToken() {
  const [registerDeviceTokenResponse, setRegisterDeviceTokenResponse] =
    useState<MessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const registerDeviceToken = useCallback(
    async (payload: RegisterDeviceTokenRequest) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const result = await notificationService.registerDeviceToken(payload);
        setRegisterDeviceTokenResponse(result);
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
    []
  );

  return {
    registerDeviceTokenResponse,
    registerDeviceToken,
    isLoading,
    isError,
    error,
  };
}
