import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { adminService } from '@/services';
import type { PaginationParams } from '@/services/api/adminSerivce';
import type { ApiErrorDTO } from '@/types';
import type { BannedUsersResponse } from '@/types/admin';

export function useBannedUsers(params?: PaginationParams) {
  const [users, setUsers] = useState<BannedUsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const page = params?.page;
  const size = params?.size;

  const getBannedUsers = useCallback(
    async (overrideParams?: PaginationParams) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const result = await adminService.getBannedUsers(
          overrideParams ?? { page, size }
        );
        setUsers(result);
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
    void getBannedUsers();
  }, [getBannedUsers]);

  return {
    users,
    getBannedUsers,
    isLoading,
    isError,
    error,
  };
}
