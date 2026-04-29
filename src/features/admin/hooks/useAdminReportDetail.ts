import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { adminService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { AdminReportDetail } from '@/types/admin';

export function useAdminReportDetail(reportId?: number | null) {
  const [reportDetail, setReportDetail] = useState<AdminReportDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const getReportDetail = useCallback(async () => {
    if (reportId === undefined || reportId === null) {
      setReportDetail(null);
      return null;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await adminService.getReportById(reportId);
      setReportDetail(result);
      return result;
    } catch (caughtError) {
      const normalizedError = normalizeApiError(caughtError);
      setIsError(true);
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId === undefined || reportId === null) {
      setReportDetail(null);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    void getReportDetail().catch(() => undefined);
  }, [getReportDetail, reportId]);

  return {
    reportDetail,
    getReportDetail,
    isLoading,
    isError,
    error,
  };
}
