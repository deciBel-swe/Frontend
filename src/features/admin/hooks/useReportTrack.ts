import { useCallback, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { adminService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { ReportRequest } from '@/types/admin';
import type { MessageResponse } from '@/types/user';

export function useReportTrack() {
  const [reportTrackResponse, setReportTrackResponse] =
    useState<MessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const reportTrack = useCallback(
    async (trackId: number, payload: ReportRequest) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const result = await adminService.reportTrack(trackId, payload);
        setReportTrackResponse(result);
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
    reportTrackResponse,
    reportTrack,
    isLoading,
    isError,
    error,
  };
}
