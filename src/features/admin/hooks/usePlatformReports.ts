import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { adminService } from '@/services';
import type { PaginationParams } from '@/services/api/adminSerivce';
import type { ApiErrorDTO } from '@/types';
import type { AdminReportsPage } from '@/types/admin';

export function usePlatformReports(params?: PaginationParams) {
  const [reports, setReports] = useState<AdminReportsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const page = params?.page;
  const size = params?.size;

  const getPlatformReports = useCallback(
    async (overrideParams?: PaginationParams) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const result = await adminService.getPlatformReports(
          overrideParams ?? { page, size }
        );
        setReports(result);
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
    void getPlatformReports();
  }, [getPlatformReports]);

  return {
    reports,
    getPlatformReports,
    isLoading,
    isError,
    error,
  };
}
