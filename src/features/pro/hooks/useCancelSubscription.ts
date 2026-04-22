import { useCallback, useState } from 'react';

import { subscriptionService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { CancelSubscriptionResponse } from '@/types/subscription';

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

export function useCancelSubscription() {
  const [cancelResponse, setCancelResponse] =
    useState<CancelSubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const cancelSubscription = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await subscriptionService.cancelSubscription();
      setCancelResponse(response);
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

  return {
    cancelResponse,
    cancelSubscription,
    isLoading,
    isError,
    error,
  };
}
