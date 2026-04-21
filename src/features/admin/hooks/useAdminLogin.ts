import { useCallback, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { adminService } from '@/services';
import type { AdminLoginRequest } from '@/services/api/adminSerivce';
import type { ApiErrorDTO } from '@/types';
import type { AdminLoginResponse } from '@/types/admin';

export function useAdminLogin() {
  const [adminLoginResponse, setAdminLoginResponse] =
    useState<AdminLoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const adminLogin = useCallback(async (payload: AdminLoginRequest) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await adminService.adminLogin(payload);
      setAdminLoginResponse(result);
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
    adminLoginResponse,
    adminLogin,
    isLoading,
    isError,
    error,
  };
}
