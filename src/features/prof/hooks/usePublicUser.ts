import { useEffect, useState } from 'react';
import { UserPublic } from '@/types/user';
import { userService } from '@/services/index';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';

const normalizeUsername = (value: string | undefined): string =>
  decodeURIComponent(value ?? '').trim().toLowerCase();

/**
 * Hook to get user header data (cover photo, username, location)
 */
export const usePublicUser = (username: string) => {
  const profileContext = useProfileOwnerContext();
  const isManagedByContext =
    normalizeUsername(profileContext?.routeUsername) ===
    normalizeUsername(username);

  const [data, setData] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (isManagedByContext) {
      return;
    }

    let isCancelled = false;
    const normalizedUsername = username.trim();

    if (normalizedUsername.length === 0) {
      setData(null);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetchPublicUser = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const result =
          await userService.getPublicUserByUsername(normalizedUsername);
        if (!isCancelled) {
          setData(result);
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

    void fetchPublicUser();

    return () => {
      isCancelled = true;
    };
  }, [isManagedByContext, username]);

  if (isManagedByContext) {
    return {
      data: profileContext?.publicUser ?? null,
      isLoading: profileContext?.isPublicLoading ?? false,
      error: profileContext?.publicError ?? null,
    };
  }

  return {
    data,
    isLoading,
    error: isError ? 'Failed to fetch user' : null,
  };
};
