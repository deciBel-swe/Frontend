import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import type { TrackCardProps } from '@/components/tracks/track-card';
import { useInfinitePaginatedResource } from '@/hooks/useInfinitePaginatedResource';
import { feedService } from '@/services';
import type { FeedItemDTO } from '@/types/discovery';
import { mapPlaylistResourceToPlaylistCard, mapTrackResourceToTrackCard } from '@/features/search/mappers/searchResultMappers';

type FeedCardItem =
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

const toPostedText = (item: FeedItemDTO): string => {
  switch (item.type) {
    case 'TRACK_POSTED':
      return 'posted a track';
    case 'TRACK_REPOSTED':
      return 'reposted a track';
    case 'TRACK_LIKED':
      return 'liked a track';
    case 'PLAYLIST_POSTED':
      return 'posted a set';
    case 'PLAYLIST_REPOSTED':
      return 'reposted a set';
    case 'PLAYLIST_LIKED':
      return 'liked a set';
    default:
      return 'shared';
  }
};

const toFeedActor = (
  item: FeedItemDTO
): { username: string; displayName?: string; avatar?: string } | undefined => {
  const actor =
    item.repostedBy ??
    ((
      item as unknown as {
        actor?: {
          username?: string;
          displayName?: string;
          avatarUrl?: string;
        };
      }
    ).actor ??
      ((
        item as unknown as {
          likedBy?: {
            username?: string;
            displayName?: string;
            avatarUrl?: string;
          };
        }
      ).likedBy));

  if (!actor?.username) {
    return undefined;
  }

  return {
    username: actor.username,
    displayName: actor.displayName,
    avatar: actor.avatarUrl,
  };
};

const mapFeedItem = (item: FeedItemDTO): FeedCardItem | null => {
  const postedText = toPostedText(item);
  const actor = toFeedActor(item);

  if (item.resource.resourceType === 'TRACK') {
    const card = mapTrackResourceToTrackCard(item.resource);
    if (!card) {
      return null;
    }

    return {
      kind: 'track',
      id: `track-${item.id}-${item.resource.resourceId}`,
      card: {
        ...card,
        postedText,
        repostedBy: item.type === 'TRACK_REPOSTED' ? actor : card.repostedBy,
      },
    };
  }

  if (item.resource.resourceType === 'PLAYLIST') {
    const card = mapPlaylistResourceToPlaylistCard(item.resource);
    if (!card) {
      return null;
    }

    const actorUsername = actor?.username;
    const actorDisplayName = actor?.displayName;

    return {
      kind: 'playlist',
      id: `playlist-${item.id}-${item.resource.resourceId}`,
      card: {
        ...card,
        postedText,
        ...(item.type === 'PLAYLIST_REPOSTED' && actorUsername
          ? {
              repostedBy: {
                username: actorUsername,
                displayName: actorDisplayName,
                avatar: actor?.avatar,
              },
            }
          : {}),
      },
    };
  }

  return null;
};

export function useFeedTracks(page = 0, size = 25, infinite = false) {
  const [feedItems, setFeedItems] = useState<FeedItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const mapFeedItems = useCallback((items: FeedItemDTO[]) => {
    return items.flatMap((item) => {
      const mapped = mapFeedItem(item);
      return mapped ? [mapped] : [];
    });
  }, []);

  const {
    items: infiniteFeedItems,
    hasMore,
    isPaginating,
    isInitialLoading,
    isError: isInfiniteError,
    sentinelRef,
    loadNextPage,
  } = useInfinitePaginatedResource<FeedCardItem>({
    enabled: infinite,
    pageSize: size,
    resetKey: `${size}|${refreshIndex}`,
    fetchPage: async (pageNumber, pageSize) => {
      const response = await feedService.getfeed({ page: pageNumber, size: pageSize });

      return {
        items: mapFeedItems(response.content ?? []),
        pageNumber: response.pageNumber,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        isLast: response.isLast,
        last: Boolean(response.last),
      };
    },
    dedupeBy: (item) => item.id,
    initialErrorMessage: 'Failed to load tracks. Please try again later.',
  });

  useEffect(() => {
    if (infinite) {
      return;
    }

    let isCancelled = false;

    const fetchFeed = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await feedService.getfeed({ page, size });
        if (!isCancelled) {
          setFeedItems(response.content);
        }
      } catch {
        if (!isCancelled) {
          setFeedItems([]);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchFeed();

    return () => {
      isCancelled = true;
    };
  }, [infinite, page, refreshIndex, size]);

  const feedCards = useMemo(() => {
    if (infinite) {
      return infiniteFeedItems;
    }

    return mapFeedItems(feedItems);
  }, [feedItems, infinite, infiniteFeedItems, mapFeedItems]);

  return {
    feedItems: feedCards,
    isLoading: infinite ? isInitialLoading : isLoading,
    isError: infinite ? isInfiniteError : isError,
    hasMore: infinite ? hasMore : false,
    isPaginating: infinite ? isPaginating : false,
    sentinelRef: infinite ? sentinelRef : undefined,
    loadNextPage: infinite ? loadNextPage : undefined,
  };
}
