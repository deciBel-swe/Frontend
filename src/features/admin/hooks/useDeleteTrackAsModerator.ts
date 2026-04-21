import { useCallback, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { adminService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { MessageResponse } from '@/types/user';

export function useDeleteTrackAsModerator() {
  const [deleteTrackResponse, setDeleteTrackResponse] =
    useState<MessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const deleteTrackAsModerator = useCallback(async (trackId: number) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await adminService.deleteTrackAsModerator(trackId);
      setDeleteTrackResponse(result);
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
    deleteTrackResponse,
    deleteTrackAsModerator,
    isLoading,
    isError,
    error,
  };
}
