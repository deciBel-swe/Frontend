'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import type { TrackCardProps } from '@/components/tracks/track-card';
import { useAuth } from '@/features/auth';
import {
  mapPlaylistResourceToPlaylistCard,
  mapTrackResourceToTrackCard,
} from '@/features/search/mappers/searchResultMappers';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { useInfinitePaginatedResource } from '@/hooks/useInfinitePaginatedResource';
import { userService } from '@/services';

const normalizeIdentity = (value: string | undefined): string =>
  (value ?? '').trim().toLowerCase();

type RepostedByShape = {
  username?: string;
  displayName?: string;
  avatarUrl?: string;
};

export type UserRepostPageItem =
  | {
      kind: 'track';
      id: string;
      card: TrackCardProps;
    }
  | {
      kind: 'playlist';
      id: string;
      card: PlaylistHorizontalProps;
    };

const toRepostedBy = (
  repostedBy: RepostedByShape | undefined,
  fallbackUsername: string
): TrackCardProps['repostedBy'] | undefined => {
  if (repostedBy?.username) {
    return {
      username: repostedBy.username,
      displayName: repostedBy.displayName,
      avatar: repostedBy.avatarUrl,
    };
  }

  const normalizedFallback = fallbackUsername.trim();
  if (!normalizedFallback) {
    return undefined;
  }

  return {
    username: normalizedFallback,
    displayName: undefined,
  };
};

type UseUserRepostPageOptions = {
  page?: number;
  size?: number;
  infinite?: boolean;
};

export function useUserRepostPage(
  routeUsername?: string,
  options: UseUserRepostPageOptions = {}
) {
  const { page = 0, size = 10, infinite = false } = options;
  const { user } = useAuth();
  const ownerContext = useProfileOwnerContext();
  const [items, setItems] = useState<UserRepostPageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const targetUsername =
    routeUsername?.trim() ||
    ownerContext?.routeUsername?.trim() ||
    user?.username?.trim() ||
    '';

  const fetchRepostPage = useCallback(
    async (pageNumber: number, pageSize: number) => {
      if (!targetUsername) {
        return {
          items: [],
          pageNumber,
          totalPages: 0,
          totalElements: 0,
          isLast: true,
        };
      }

      let targetUserId: number | undefined;

      const contextUsername = ownerContext?.routeUsername;
      const contextUserId = ownerContext?.publicUser?.profile.id;

      if (
        contextUserId &&
        normalizeIdentity(contextUsername) === normalizeIdentity(targetUsername)
      ) {
        targetUserId = contextUserId;
      } else if (
        user?.id !== undefined &&
        normalizeIdentity(user.username) === normalizeIdentity(targetUsername)
      ) {
        targetUserId = user.id;
      } else {
        const publicUser = await userService.getPublicUserByUsername(targetUsername);
        targetUserId = publicUser.profile.id;
      }

      if (!targetUserId) {
        throw new Error('Unable to resolve repost owner id.');
      }

      const response = await userService.getUserReposts(targetUserId, {
        page: pageNumber,
        size: pageSize,
      });

      return {
        items: response.content.flatMap(
          (resource, index): UserRepostPageItem[] => {
            const repostedBy = (
              resource as { repostedBy?: RepostedByShape }
            ).repostedBy;

            if (resource.resourceType === 'TRACK') {
              const trackCard = mapTrackResourceToTrackCard(resource);
              if (!trackCard) {
                return [];
              }

              return [
                {
                  kind: 'track',
                  id: `track-${resource.resourceId}-${pageNumber}-${index}`,
                  card: {
                    ...trackCard,
                    postedText: 'reposted a track',
                    repostedBy: toRepostedBy(repostedBy, targetUsername),
                  },
                } satisfies UserRepostPageItem,
              ];
            }

            if (resource.resourceType === 'PLAYLIST') {
              const playlistCard = mapPlaylistResourceToPlaylistCard(resource);
              if (!playlistCard) {
                return [];
              }

              return [
                {
                  kind: 'playlist',
                  id: `playlist-${resource.resourceId}-${pageNumber}-${index}`,
                  card: {
                    ...playlistCard,
                    postedText: 'reposted a set',
                    repostedBy: toRepostedBy(repostedBy, targetUsername),
                  },
                } satisfies UserRepostPageItem,
              ];
            }

            return [];
          }
        ),
        pageNumber: response.pageNumber,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        isLast: response.isLast,
        last: Boolean(response.last),
      };
    },
    [
      ownerContext?.publicUser?.profile.id,
      ownerContext?.routeUsername,
      targetUsername,
      user?.id,
      user?.username,
    ]
  );

  const {
    items: infiniteItems,
    hasMore,
    isPaginating,
    isInitialLoading,
    isError: isInfiniteError,
    sentinelRef,
    loadNextPage,
  } = useInfinitePaginatedResource<UserRepostPageItem>({
    enabled: infinite && targetUsername.length > 0,
    pageSize: size,
    resetKey: `${targetUsername}|${size}|${ownerContext?.publicUser?.profile.id ?? ''}`,
    fetchPage: fetchRepostPage,
    dedupeBy: (item) => item.id,
    initialErrorMessage: 'Failed to load reposted resources. Please try again later.',
  });

  useEffect(() => {
    if (infinite) {
      return;
    }

    let isCancelled = false;

    const loadReposts = async () => {
      if (!targetUsername) {
        if (!isCancelled) {
          setItems([]);
          setIsLoading(false);
          setIsError(false);
        }
        return;
      }

      setIsLoading(true);
      setIsError(false);

      try {
        const response = await fetchRepostPage(page, size);

        if (!isCancelled) {
          setItems(response.items);
          setIsLoading(false);
          setIsError(false);
        }
      } catch {
        if (!isCancelled) {
          setItems([]);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadReposts();

    return () => {
      isCancelled = true;
    };
  }, [
    fetchRepostPage,
    infinite,
    page,
    size,
    targetUsername,
  ]);

  return {
    items: infinite ? infiniteItems : items,
    isLoading: infinite ? isInitialLoading : isLoading,
    isError: infinite ? isInfiniteError : isError,
    hasMore: infinite ? hasMore : false,
    isPaginating: infinite ? isPaginating : false,
    sentinelRef: infinite ? sentinelRef : undefined,
    loadNextPage: infinite ? loadNextPage : undefined,
  };
}
