import { useEffect, useState } from 'react';
import { trackService } from '@/services';
import { userService } from '@/services';

type UseUserTracksParams = {
  userId?: number;
  username?: string;
};

/**
 * Lightweight hook for requesting user tracks.
 *
 * This is intentionally simple and can be expanded later with
 * pagination/filtering once real page logic is finalized.
 */
export function useUserTracks(params: UseUserTracksParams) {
  const [tracks, setTracks] = useState<
    Awaited<ReturnType<typeof trackService.getUserTracks>>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleUpdate = () => {
      setRefreshIndex((prev) => prev + 1);
    };

    window.addEventListener('track-updated', handleUpdate);
    return () => {
      window.removeEventListener('track-updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadTracks = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        let resolvedUserId = params.userId;
        const normalizedUsername = params.username?.trim() ?? '';

        if (!resolvedUserId && normalizedUsername.length > 0) {
          const publicUser =
            await userService.getPublicUserByUsername(normalizedUsername);
          resolvedUserId = publicUser.id;
        }

        if (!resolvedUserId) {
          if (!isCancelled) {
            setTracks([]);
          }
          return;
        }

        const data = await trackService.getUserTracks(resolvedUserId);
        if (!isCancelled) {
          setTracks(data);
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

    void loadTracks();

    return () => {
      isCancelled = true;
    };
  }, [params.userId, params.username, refreshIndex]);

  return {
    tracks,
    isLoading,
    isError,
  };
}
