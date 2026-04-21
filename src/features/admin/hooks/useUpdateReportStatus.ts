import { useCallback, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { adminService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { UpdateAdminReportStatusRequest } from '@/types/admin';
import type { MessageResponse } from '@/types/user';

export function useUpdateReportStatus() {
  const [updateReportStatusResponse, setUpdateReportStatusResponse] =
    useState<MessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const updateReportStatus = useCallback(
    async (reportId: number, payload: UpdateAdminReportStatusRequest) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const result = await adminService.updateReportStatus(reportId, payload);
        setUpdateReportStatusResponse(result);
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
    updateReportStatusResponse,
    updateReportStatus,
    isLoading,
    isError,
    error,
  };
}
