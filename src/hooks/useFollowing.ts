import { useCallback, useEffect, useRef, useState } from 'react';

import { useInfinitePaginatedResource } from '@/hooks/useInfinitePaginatedResource';
import type { UserCardData } from '@/features/social/components/UserCard';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { userService } from '@/services';
import type { SearchUser } from '@/types/user';

type UseFollowingParams = {
  username: string;
  page?: number;
  size?: number;
  infinite?: boolean;
};

const normalizeUsername = (value: string | undefined): string =>
  decodeURIComponent(value ?? '').trim().toLowerCase();

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

export function useFollowing({
  username,
  page = 0,
  size = 48,
  infinite = false,
}: UseFollowingParams) {
  const profileContext = useProfileOwnerContext();
  const resolvedUserIdRef = useRef<number | undefined>(undefined);
  const [users, setUsers] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const isManagedByContext =
    normalizeUsername(profileContext?.routeUsername) ===
    normalizeUsername(username);
  const contextUserId = profileContext?.publicUser?.profile.id;
  const normalizedUsername = username.trim();

  const resolveUserId = useCallback(async () => {
    if (resolvedUserIdRef.current) {
      return resolvedUserIdRef.current;
    }

    if (isManagedByContext && typeof contextUserId === 'number') {
      resolvedUserIdRef.current = contextUserId;
      return contextUserId;
    }

    if (normalizedUsername.length === 0) {
      return undefined;
    }

    const publicUser =
      await userService.getPublicUserByUsername(normalizedUsername);
    resolvedUserIdRef.current = publicUser.profile.id;
    return resolvedUserIdRef.current;
  }, [contextUserId, isManagedByContext, normalizedUsername]);

  useEffect(() => {
    resolvedUserIdRef.current = undefined;
  }, [contextUserId, isManagedByContext, normalizedUsername]);

  const {
    items: infiniteUsers,
    hasMore,
    isPaginating,
    isInitialLoading,
    isError: isInfiniteError,
    sentinelRef,
    loadNextPage,
  } = useInfinitePaginatedResource<UserCardData>({
    enabled: infinite && normalizedUsername.length > 0,
    pageSize: size,
    resetKey: [
      normalizedUsername,
      String(size),
      String(contextUserId ?? ''),
      String(isManagedByContext),
    ].join('|'),
    fetchPage: async (pageNumber, pageSize) => {
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

      const response = await userService.getFollowing(resolvedUserId, {
        page: pageNumber,
        size: pageSize,
      });

      return {
        items: response.content.map(toUserCardData),
        pageNumber: response.pageNumber,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        isLast: response.isLast,
        last: Boolean(response.last),
      };
    },
    dedupeBy: (user) => user.id,
    initialErrorMessage: 'Failed to load following users. Please try again later.',
  });

  useEffect(() => {
    if (infinite) {
      return;
    }

    let isCancelled = false;

    const loadFollowing = async () => {
      if (normalizedUsername.length === 0) {
        setUsers([]);
        setIsLoading(false);
        setIsError(false);
        return;
      }

      setIsLoading(true);
      setIsError(false);

      try {
        const resolvedUserId = await resolveUserId();
        if (!resolvedUserId) {
          setUsers([]);
          return;
        }

        const response = await userService.getFollowing(resolvedUserId, {
          page,
          size,
        });

        if (!isCancelled) {
          setUsers(response.content.map(toUserCardData));
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

    void loadFollowing();

    return () => {
      isCancelled = true;
    };
  }, [infinite, normalizedUsername, page, resolveUserId, size]);

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
