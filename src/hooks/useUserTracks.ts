import { useEffect, useState } from 'react';
import { trackService } from '@/services';
import { userService } from '@/services';
import { ApiErrorDTO } from '@/types';
import { ApiError } from 'next/dist/server/api-utils';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';

const normalizeUsername = (value: string | undefined): string =>
  decodeURIComponent(value ?? '').trim().toLowerCase();

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
  const profileContext = useProfileOwnerContext();
  const isManagedByContext =
    normalizeUsername(profileContext?.routeUsername) ===
    normalizeUsername(params.username);
  const isOwnedProfile = isManagedByContext && Boolean(profileContext?.isOwner);
  const contextPublicUserId = profileContext?.publicUser?.profile.id;

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

        if (isOwnedProfile) {
          const data = await trackService.getMyTracks();
          if (!isCancelled) {
            setTracks(data);
          }
          return;
        }

        if (
          !resolvedUserId &&
          isManagedByContext &&
          contextPublicUserId
        ) {
          resolvedUserId = contextPublicUserId;
        }

        if (!resolvedUserId && normalizedUsername.length > 0) {
          const publicUser =
            await userService.getPublicUserByUsername(normalizedUsername);
          resolvedUserId = publicUser.profile.id;
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
      } catch(error){
        if (!isCancelled) {
          setIsError(true);
        }
        if (error instanceof ApiError) {
          const apiError = error as ApiErrorDTO;
          console.error('API Error fetching user tracks:', apiError.message);
        } else {
          console.error('Unexpected error fetching user tracks:', error);
          throw error;
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
  }, [
    contextPublicUserId,
    isOwnedProfile,
    isManagedByContext,
    params.userId,
    params.username,
    refreshIndex,
  ]);

  return {
    tracks,
    isLoading,
    isError,
  };
}
