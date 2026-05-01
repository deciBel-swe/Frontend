import { useCallback, useEffect, useState } from 'react';

import { subscriptionService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { SubscriptionStatusDTO } from '@/types/subscription';

type UseSubscriptionStatusOptions = {
  enabled?: boolean;
};

const toApiError = (error: unknown): ApiErrorDTO => {
  if (
    error !== null &&
    typeof error === 'object' &&
    'statusCode' in error &&
    'message' in error
  ) {
    return error as ApiErrorDTO;
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    message: 'Unexpected API error',
  };
};

export function useSubscriptionStatus(
  options: UseSubscriptionStatusOptions = {}
) {
  const { enabled = true } = options;
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatusDTO | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const fetchSubscriptionStatus = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(response);
      return response;
    } catch (caughtError) {
      const normalizedError = toApiError(caughtError);
      setIsError(true);
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    void fetchSubscriptionStatus().catch(() => undefined);
  }, [enabled, fetchSubscriptionStatus]);

  return {
    subscriptionStatus,
    fetchSubscriptionStatus,
    isLoading,
    isError,
    error,
  };
}
