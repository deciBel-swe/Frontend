import { useCallback, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { adminService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { MessageResponse } from '@/types/user';

export function useUnbanUser() {
  const [unbanUserResponse, setUnbanUserResponse] =
    useState<MessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const unbanUser = useCallback(async (userId: number) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await adminService.unbanUser(userId);
      setUnbanUserResponse(result);
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
    unbanUserResponse,
    unbanUser,
    isLoading,
    isError,
    error,
  };
}
