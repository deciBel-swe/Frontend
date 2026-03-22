import { useEffect, useState } from 'react';
import { authService } from '@/services';
import { userService } from '@/services/index';
import { UserMe } from '@/types/user';

/**
 * Hook to get the current authenticated user's data via /users/me.
 */
// TODO : currently doesn't work fixing it later
export const useUserMe = () => {
  const [user, setUser] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchMe = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const session = await authService.getSession();

        if (!session?.accessToken) {
          if (!isCancelled) {
            setUser(null);
          }
          return;
        }

        const me = await userService.getUserMe();
        if (!isCancelled) {
          setUser(me ?? null);
        }
      } catch {
        if (!isCancelled) {
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchMe();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    user,
    isLoading,
    error: isError ? 'Failed to fetch current user data' : null,
  };
};
