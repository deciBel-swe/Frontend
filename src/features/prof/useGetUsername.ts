import { useEffect, useMemo, useState } from 'react';
import { config } from '@/config';
import { authService } from '@/services';
import { RealUserService, UserService } from '@/services/api/userService';
import { MockUserService } from '@/services/mocks/userService';

/**
 * Hook to get the current authenticated user's username via /users/me.
 */
export const useGetUsername = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userService: UserService = useMemo(
    () => (config.api.useMock ? new MockUserService() : new RealUserService()),
    []
  );

  useEffect(() => {
    let cancelled = false;

    const fetchCurrentUsername = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const session = await authService.getSession();

        if (!session?.accessToken) {
          if (!cancelled) setUsername(null);
          return;
        }

        const me = await userService.getUserMe(session.accessToken);
        if (!cancelled) setUsername(me.username ?? null);
      } catch {
        if (!cancelled) {
          setError('Failed to fetch current username');
          setUsername(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchCurrentUsername();

    return () => {
      cancelled = true;
    };
  }, [userService]);

  return { username, isLoading, error };
};
