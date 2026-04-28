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
import type { ResourceRefFullDTO } from '@/types/discovery';
import type { FullPlaylistDTO } from '@/types/playlists';
import type { FullTrackDTO } from '@/types/tracks';

type RepostedByShape = {
  username?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
};

type RepostMetadataShape = {
  repostedBy?: RepostedByShape | null;
  repostedAt?: string | null;
};

type FlatTrackRepostDTO = FullTrackDTO & RepostMetadataShape;

type FlatPlaylistRepostDTO = FullPlaylistDTO & RepostMetadataShape;

type RepostResourceDTO =
  | ResourceRefFullDTO
  | FlatTrackRepostDTO
  | FlatPlaylistRepostDTO;

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
      displayName: repostedBy.displayName ?? undefined,
      avatar: repostedBy.avatarUrl ?? undefined,
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

const normalizeRepostResource = (
  resource: RepostResourceDTO
): ResourceRefFullDTO | null => {
  if ('type' in resource) {
    if (resource.type === 'TRACK' && resource.track) {
      return resource as ResourceRefFullDTO;
    }

    if (resource.type === 'PLAYLIST' && resource.playlist) {
      return resource as ResourceRefFullDTO;
    }

    return null;
  }

  if ('trackSlug' in resource) {
    return {
      type: 'TRACK',
      id: resource.id,
      track: resource as FullTrackDTO,
      playlist: null,
      user: null,
      repostedBy: resource.repostedBy
        ? ({
            username: resource.repostedBy.username,
            displayName: resource.repostedBy.displayName,
            avatarUrl: resource.repostedBy.avatarUrl,
          } as ResourceRefFullDTO['repostedBy'])
        : null,
      repostedAt: resource.repostedAt ?? '',
    };
  }

  if ('playlistSlug' in resource) {
    return {
      type: 'PLAYLIST',
      id: resource.id,
      track: null,
      playlist: resource as FullPlaylistDTO,
      user: null,
      repostedBy: resource.repostedBy
        ? ({
            username: resource.repostedBy.username,
            displayName: resource.repostedBy.displayName,
            avatarUrl: resource.repostedBy.avatarUrl,
          } as ResourceRefFullDTO['repostedBy'])
        : null,
      repostedAt: resource.repostedAt ?? '',
    };
  }

  return null;
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

      const response = await userService.getUserReposts(targetUsername, {
        page: pageNumber,
        size: pageSize,
      });
      const repostResources = response.content as RepostResourceDTO[];

      return {
        items: repostResources.flatMap(
          (resource, index): UserRepostPageItem[] => {
            const normalizedResource = normalizeRepostResource(resource);
            if (!normalizedResource) {
              return [];
            }

            const repostedBy = normalizedResource.repostedBy ?? undefined;

            if (normalizedResource.type === 'TRACK') {
              const trackCard = mapTrackResourceToTrackCard(normalizedResource);
              if (!trackCard) {
                return [];
              }

              return [
                {
                  kind: 'track',
                  id: `track-${normalizedResource.id}-${pageNumber}-${index}`,
                  card: {
                    ...trackCard,
                    postedText: 'reposted a track',
                    repostedBy: toRepostedBy(repostedBy, targetUsername),
                  },
                } satisfies UserRepostPageItem,
              ];
            }

            if (normalizedResource.type === 'PLAYLIST') {
              const playlistCard =
                mapPlaylistResourceToPlaylistCard(normalizedResource);
              if (!playlistCard) {
                return [];
              }

              return [
                {
                  kind: 'playlist',
                  id: `playlist-${normalizedResource.id}-${pageNumber}-${index}`,
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
    [targetUsername]
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
    resetKey: `${targetUsername}|${size}`,
    fetchPage: fetchRepostPage,
    dedupeBy: (item) => item.id,
    initialErrorMessage:
      'Failed to load reposted resources. Please try again later.',
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
  }, [fetchRepostPage, infinite, page, size, targetUsername]);

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
