import { useEffect, useState } from 'react';

import type { UserCardData } from '@/features/social/components/UserCard';
import { useInfinitePaginatedResource } from '@/hooks/useInfinitePaginatedResource';
import { userService } from '@/services';
import type { SearchUser } from '@/types/user';

type UseSuggestedUsersParams = {
  size?: number;
  infinite?: boolean;
};

const toUserCardData = (user: SearchUser, index: number): UserCardData => {
  const canonicalUsername = user.username?.trim() || 'unknown';
  const displayName = user.displayName?.trim() || undefined;
  const fallbackId = `${canonicalUsername}-${index}`;

  return {
    id: String(user.id ?? fallbackId),
    username: canonicalUsername,
    displayName,
    avatarSrc: user.avatarUrl ?? undefined,
    followerCount: 0,
    isFollowing: user.isFollowing ?? false,
  };
};

export function useSuggestedUsers({
  size = 12,
  infinite = false,
}: UseSuggestedUsersParams = {}) {
  const [users, setUsers] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const {
    items: infiniteUsers,
    hasMore,
    isPaginating,
    isInitialLoading,
    isError: isInfiniteError,
    sentinelRef,
    loadNextPage,
  } = useInfinitePaginatedResource<UserCardData>({
    enabled: infinite,
    pageSize: size,
    resetKey: `${size}`,
    fetchPage: async (pageNumber, pageSize) => {
      const requestedSize = Math.max(pageSize, (pageNumber + 1) * pageSize);
      const suggestedUsers = await userService.getSuggestedUsers(requestedSize);
      const mappedUsers = suggestedUsers.map(toUserCardData);
      const start = pageNumber * pageSize;
      const items = mappedUsers.slice(start, start + pageSize);

      return {
        items,
        pageNumber,
        totalElements: mappedUsers.length,
        totalPages:
          mappedUsers.length === 0
            ? 1
            : Math.ceil(mappedUsers.length / Math.max(1, pageSize)),
        isLast: mappedUsers.length <= start + items.length,
      };
    },
    dedupeBy: (user) => user.id,
    initialErrorMessage: 'Failed to load suggested users. Please try again later.',
  });

  useEffect(() => {
    if (infinite) {
      return;
    }

    let isCancelled = false;

    const loadSuggestedUsers = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const suggestedUsers = await userService.getSuggestedUsers(size);

        if (!isCancelled) {
          setUsers(suggestedUsers.map(toUserCardData));
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

    void loadSuggestedUsers();

    return () => {
      isCancelled = true;
    };
  }, [infinite, size]);

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
