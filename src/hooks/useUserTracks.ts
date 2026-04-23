import { useCallback, useEffect, useRef, useState } from 'react';
import { trackService } from '@/services';
import { userService } from '@/services';
import { ApiErrorDTO } from '@/types';
import { ApiError } from 'next/dist/server/api-utils';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { useInfinitePaginatedResource } from '@/hooks/useInfinitePaginatedResource';

const normalizeUsername = (value: string | undefined): string =>
  decodeURIComponent(value ?? '').trim().toLowerCase();

type UseUserTracksParams = {
  userId?: number;
  username?: string;
  page?: number;
  size?: number;
  infinite?: boolean;
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
  const resolvedUserIdRef = useRef<number | undefined>(undefined);
  const page = params.page ?? 0;
  const size = params.size ?? 24;
  const infinite = params.infinite ?? false;
  const normalizedUsername = params.username?.trim() ?? '';

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

  const resolveUserId = useCallback(async () => {
    if (typeof params.userId === 'number') {
      resolvedUserIdRef.current = params.userId;
      return params.userId;
    }

    if (
      isManagedByContext &&
      typeof contextPublicUserId === 'number'
    ) {
      resolvedUserIdRef.current = contextPublicUserId;
      return contextPublicUserId;
    }

    if (normalizedUsername.length === 0) {
      return undefined;
    }

    if (resolvedUserIdRef.current) {
      return resolvedUserIdRef.current;
    }

    const publicUser =
      await userService.getPublicUserByUsername(normalizedUsername);
    resolvedUserIdRef.current = publicUser.profile.id;
    return resolvedUserIdRef.current;
  }, [
    contextPublicUserId,
    isManagedByContext,
    normalizedUsername,
    params.userId,
  ]);

  useEffect(() => {
    resolvedUserIdRef.current = undefined;
  }, [contextPublicUserId, isManagedByContext, normalizedUsername, params.userId]);

  const fetchTrackPage = useCallback(
    async (pageNumber: number, pageSize: number) => {
      if (isOwnedProfile) {
        const items = await trackService.getMyTracks({
          page: pageNumber,
          size: pageSize,
        });

        return {
          items,
          pageNumber,
          totalPages: items.length < pageSize ? pageNumber + 1 : pageNumber + 2,
          totalElements: pageNumber * pageSize + items.length,
          isLast: items.length < pageSize,
        };
      }

      const resolvedUserId = await resolveUserId();

      if (!resolvedUserId) {
        return {
          items: [],
          pageNumber,
          totalPages: 0,
          totalElements: 0,
          isLast: true,
        };
      }

      const response = await userService.getUserTracks(resolvedUserId, {
        page: pageNumber,
        size: pageSize,
      });

      const items = (
        await Promise.all(
          (response.content ?? []).map(async (track) => {
            if (typeof track.id !== 'number') {
              return null;
            }

            try {
              return await trackService.getTrackMetadata(track.id);
            } catch {
              return null;
            }
          })
        )
      ).filter((track): track is Awaited<ReturnType<typeof trackService.getTrackMetadata>> => track !== null);

      return {
        items,
        pageNumber: response.pageNumber,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        isLast: response.isLast,
        last: Boolean(response.last),
      };
    },
    [isOwnedProfile, resolveUserId]
  );

  const {
    items: infiniteTracks,
    hasMore,
    isPaginating,
    isInitialLoading,
    isError: isInfiniteError,
    sentinelRef,
    loadNextPage,
  } = useInfinitePaginatedResource<
    Awaited<ReturnType<typeof trackService.getTrackMetadata>>
  >({
    enabled:
      infinite &&
      (typeof params.userId === 'number' || normalizedUsername.length > 0 || Boolean(contextPublicUserId)),
    pageSize: size,
    resetKey: [
      String(params.userId ?? ''),
      normalizedUsername,
      String(contextPublicUserId ?? ''),
      String(isOwnedProfile),
      String(refreshIndex),
      String(size),
    ].join('|'),
    fetchPage: fetchTrackPage,
    dedupeBy: (track) => String(track.id),
    initialErrorMessage: 'Failed to load tracks. Please try again later.',
  });

  useEffect(() => {
    if (infinite) {
      return;
    }

    let isCancelled = false;

    const loadTracks = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await fetchTrackPage(page, size);

        if (response.items.length === 0 && !(await resolveUserId())) {
          if (!isCancelled) {
            setTracks([]);
          }
          return;
        }

        if (!isCancelled) {
          setTracks(response.items);
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
    fetchTrackPage,
    infinite,
    page,
    refreshIndex,
    resolveUserId,
    size,
  ]);

  return {
    tracks: infinite ? infiniteTracks : tracks,
    isLoading: infinite ? isInitialLoading : isLoading,
    isError: infinite ? isInfiniteError : isError,
    hasMore: infinite ? hasMore : false,
    isPaginating: infinite ? isPaginating : false,
    sentinelRef: infinite ? sentinelRef : undefined,
    loadNextPage: infinite ? loadNextPage : undefined,
  };
}
