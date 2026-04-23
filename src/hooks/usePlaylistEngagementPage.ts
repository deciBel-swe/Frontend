import { useCallback, useEffect, useRef, useState } from 'react';
import type { UserCardData } from '@/features/social/components/UserCard';
import { useInfinitePaginatedResource } from '@/hooks/useInfinitePaginatedResource';
import { feedService } from '@/services';
import type { FeedItemDTO } from '@/types/discovery';
import { resolvePlaylistIdFromIdentifier } from '@/utils/resourceIdentifierResolvers';

type EngagementType = 'likes' | 'reposts';

type UsePlaylistEngagementPageParams = {
  playlistId: string;
  type: EngagementType;
  page?: number;
  size?: number;
  infinite?: boolean;
};

type LooseUser = {
  id?: number | string | null;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  isFollowing?: boolean | null;
};

const toUserCardData = (user: LooseUser, index: number): UserCardData => {
  const canonicalUsername = user.username?.trim() || 'unknown';
  const displayName = user.displayName?.trim() || undefined;
  const normalizedId =
    typeof user.id === 'number' || typeof user.id === 'string'
      ? String(user.id)
      : undefined;

  return {
    id: normalizedId ?? `${canonicalUsername}-${index}`,
    username: canonicalUsername,
    displayName,
    avatarSrc: user.avatarUrl ?? undefined,
    followerCount: 0,
    isFollowing: Boolean(user.isFollowing),
  };
};

const resolveActor = (item: FeedItemDTO): LooseUser | null => {
  const actor =
    item.repostedBy ??
    ((item as unknown as { actor?: LooseUser }).actor ??
      (item as unknown as { likedBy?: LooseUser }).likedBy);

  if (!actor?.username) {
    return null;
  }

  return actor;
};

const isTargetEvent = (
  item: FeedItemDTO,
  playlistId: number,
  type: EngagementType
): boolean => {
  if (item.resource.resourceType !== 'PLAYLIST') {
    return false;
  }

  if (item.resource.resourceId !== playlistId) {
    return false;
  }

  if (type === 'likes') {
    return item.type === 'PLAYLIST_LIKED';
  }

  return item.type === 'PLAYLIST_REPOSTED';
};

export function usePlaylistEngagementPage({
  playlistId,
  type,
  page = 0,
  size = 48,
  infinite = false,
}: UsePlaylistEngagementPageParams) {
  const [users, setUsers] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const normalizedPlaylistId = playlistId.trim();
  const allUsersCacheRef = useRef<UserCardData[] | null>(null);
  const cacheKeyRef = useRef('');

  const fetchAllActors = useCallback(async () => {
    const cacheKey = `${playlistId}|${type}`;
    if (cacheKeyRef.current === cacheKey && allUsersCacheRef.current) {
      return allUsersCacheRef.current;
    }

    const parsedPlaylistId = await resolvePlaylistIdFromIdentifier(playlistId);
    const actorsById = new Map<string, LooseUser>();

    let currentPage = 0;
    let isLast = false;
    const feedPageSize = 50;
    let safety = 0;

    while (!isLast && safety < 100) {
      const response = await feedService.getfeed({
        page: currentPage,
        size: feedPageSize,
      });

      for (const item of response.content) {
        if (!isTargetEvent(item, parsedPlaylistId, type)) {
          continue;
        }

        const actor = resolveActor(item);
        if (!actor?.username) {
          continue;
        }

        const actorKey =
          typeof actor.id === 'number' || typeof actor.id === 'string'
            ? String(actor.id)
            : actor.username.trim().toLowerCase();

        if (!actorsById.has(actorKey)) {
          actorsById.set(actorKey, actor);
        }
      }

      isLast = Boolean(response.isLast ?? response.last);
      currentPage += 1;
      safety += 1;
    }

    const allUsers = [...actorsById.values()].map(toUserCardData);
    cacheKeyRef.current = cacheKey;
    allUsersCacheRef.current = allUsers;
    return allUsers;
  }, [playlistId, type]);

  useEffect(() => {
    cacheKeyRef.current = '';
    allUsersCacheRef.current = null;
  }, [playlistId, type]);

  const {
    items: infiniteUsers,
    hasMore,
    isPaginating,
    isInitialLoading,
    isError: isInfiniteError,
    sentinelRef,
    loadNextPage,
    totalElements: infiniteTotalElements,
    totalPages: infiniteTotalPages,
  } = useInfinitePaginatedResource<UserCardData>({
    enabled: infinite && normalizedPlaylistId.length > 0,
    pageSize: size,
    resetKey: `${normalizedPlaylistId}|${type}|${size}`,
    fetchPage: async (pageNumber, pageSize) => {
      const allUsers = await fetchAllActors();
      const start = Math.max(0, pageNumber) * Math.max(1, pageSize);
      const items = allUsers.slice(start, start + Math.max(1, pageSize));

      return {
        items,
        pageNumber,
        totalElements: allUsers.length,
        totalPages:
          allUsers.length === 0
            ? 1
            : Math.ceil(allUsers.length / Math.max(1, pageSize)),
        isLast: allUsers.length <= start + items.length,
      };
    },
    dedupeBy: (user) => user.id,
    initialErrorMessage: 'Failed to load this engagement page. Please try again later.',
  });

  useEffect(() => {
    if (infinite) {
      return;
    }

    let isCancelled = false;

    const loadPageData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const allUsers = await fetchAllActors();
        const resolvedTotalElements = allUsers.length;
        const resolvedTotalPages =
          resolvedTotalElements === 0
            ? 1
            : Math.ceil(resolvedTotalElements / Math.max(1, size));

        const start = Math.max(0, page) * Math.max(1, size);
        const content = allUsers.slice(start, start + Math.max(1, size));

        if (!isCancelled) {
          setUsers(content);
          setTotalElements(resolvedTotalElements);
          setTotalPages(resolvedTotalPages);
        }
      } catch {
        if (!isCancelled) {
          setUsers([]);
          setTotalElements(0);
          setTotalPages(1);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPageData();

    return () => {
      isCancelled = true;
    };
  }, [fetchAllActors, infinite, page, size]);

  return {
    users: infinite ? infiniteUsers : users,
    isLoading: infinite ? isInitialLoading : isLoading,
    isError: infinite ? isInfiniteError : isError,
    page,
    size,
    totalElements: infinite ? infiniteTotalElements : totalElements,
    totalPages: infinite ? infiniteTotalPages : totalPages,
    hasMore: infinite ? hasMore : false,
    isPaginating: infinite ? isPaginating : false,
    sentinelRef: infinite ? sentinelRef : undefined,
    loadNextPage: infinite ? loadNextPage : undefined,
  };
}
