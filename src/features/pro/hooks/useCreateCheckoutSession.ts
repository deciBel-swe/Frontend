import { useCallback, useState } from 'react';

import { subscriptionService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { CheckoutResponse } from '@/types/subscription';

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

export function useCreateCheckoutSession() {
  const [checkoutSession, setCheckoutSession] =
    useState<CheckoutResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const createCheckoutSession = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await subscriptionService.createCheckoutSession();
      setCheckoutSession(response);
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
    checkoutSession,
    createCheckoutSession,
    isLoading,
    isError,
    error,
  };
}
