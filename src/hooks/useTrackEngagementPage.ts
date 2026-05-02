import { useCallback, useEffect, useState } from 'react';

import type { UserCardData } from '@/features/social/components/UserCard';
import { useInfinitePaginatedResource } from '@/hooks/useInfinitePaginatedResource';
import { trackService, userService } from '@/services';
import type { SearchUser } from '@/types/user';
import { resolveTrackIdFromIdentifier } from '@/utils/resourceIdentifierResolvers';

type EngagementType = 'likes' | 'reposts';

type UseTrackEngagementPageParams = {
  trackId: string;
  type: EngagementType;
  page?: number;
  size?: number;
  infinite?: boolean;
};

type LooseUser = Partial<SearchUser> & {
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
  const fallbackId = normalizedId ?? `${canonicalUsername}-${index}`;

  return {
    id: fallbackId,
    username: canonicalUsername,
    displayName,
    avatarSrc: user.avatarUrl ?? undefined,
    followerCount: 0,
    isFollowing: Boolean(user.isFollowing),
  };
};

export function useTrackEngagementPage({
  trackId,
  type,
  page = 0,
  size = 12,
  infinite = false,
}: UseTrackEngagementPageParams) {
  const [users, setUsers] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const normalizedTrackId = trackId.trim();

  const fetchEngagementPage = useCallback(
    async (pageNumber: number, pageSize: number) => {
      const parsedTrackId = await resolveTrackIdFromIdentifier(trackId);

      let response:
        | Awaited<ReturnType<typeof userService.getUsersWhoLikedTrack>>
        | Awaited<ReturnType<typeof userService.getUsersWhoRepostedTrack>>
        | Awaited<ReturnType<typeof trackService.getRepostUsers>>;

      if (type === 'likes') {
        response = await userService.getUsersWhoLikedTrack(parsedTrackId, {
          page: pageNumber,
          size: pageSize,
        });
      } else {
        try {
          response = await userService.getUsersWhoRepostedTrack(parsedTrackId, {
            page: pageNumber,
            size: pageSize,
          });
        } catch {
          response = await trackService.getRepostUsers(parsedTrackId, {
            page: pageNumber,
            size: pageSize,
          });
        }
      }

      return {
        items: (response.content ?? []).map(toUserCardData),
        pageNumber: response.pageNumber,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        isLast: response.isLast,
        last: Boolean(response.last),
      };
    },
    [trackId, type]
  );

  const {
    items: infiniteUsers,
    hasMore,
    isPaginating,
    isInitialLoading,
    isError: isInfiniteError,
    sentinelRef,
    loadNextPage,
  } = useInfinitePaginatedResource<UserCardData>({
    enabled: infinite && normalizedTrackId.length > 0,
    pageSize: size,
    resetKey: `${normalizedTrackId}|${type}|${size}`,
    fetchPage: fetchEngagementPage,
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
        const response = await fetchEngagementPage(page, size);

        if (!isCancelled) {
          setUsers(response.items);
        }
      } catch {
        if (!isCancelled) {
          setUsers([]);
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
  }, [fetchEngagementPage, infinite, page, size]);

  return {
    users: infinite ? infiniteUsers : users,
    isLoading: infinite ? isInitialLoading : isLoading,
    isError: infinite ? isInfiniteError : isError,
    hasMore: infinite ? hasMore : false,
    isPaginating: infinite ? isPaginating : false,
    sentinelRef: infinite ? sentinelRef : undefined,
    loadNextPage: infinite ? loadNextPage : undefined,
  };
}
