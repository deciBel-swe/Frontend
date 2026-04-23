import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { adminService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { PlatformAnalyticsResponse } from '@/types/admin';

export function usePlatformAnalytics() {
  const [analytics, setAnalytics] = useState<PlatformAnalyticsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const getPlatformAnalytics = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await adminService.getPlatformAnalytics();
      setAnalytics(result);
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

  useEffect(() => {
    void getPlatformAnalytics();
  }, [getPlatformAnalytics]);

  return {
    analytics,
    getPlatformAnalytics,
    isLoading,
    isError,
    error,
  };
}
