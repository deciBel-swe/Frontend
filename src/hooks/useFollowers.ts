import { useEffect, useState } from 'react';

import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { userService } from '@/services';
import type { SearchUser } from '@/types/user';
import type { UserCardData } from '@/components/ui/social/UserCard';

type UseFollowersParams = {
  username: string;
  page?: number;
  size?: number;
};

const normalizeUsername = (value: string | undefined): string =>
  decodeURIComponent(value ?? '').trim().toLowerCase();

const toUserCardData = (user: SearchUser, index: number): UserCardData => {
  const resolvedName = user.username ?? user.displayName ?? 'unknown';
  const fallbackId = `${resolvedName}-${index}`;
  return {
    id: String(user.id ?? fallbackId),
    username: resolvedName,
    avatarSrc: user.avatarUrl ?? undefined,
    followerCount: 0,
    isFollowing: user.isFollowing ?? false,
  };
};

export function useFollowers({
  username,
  page = 0,
  size = 48,
}: UseFollowersParams) {
  const profileContext = useProfileOwnerContext();
  const [users, setUsers] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const isManagedByContext =
    normalizeUsername(profileContext?.routeUsername) ===
    normalizeUsername(username);
  const contextUserId = profileContext?.publicUser?.profile.id;

  useEffect(() => {
    let isCancelled = false;

    const loadFollowers = async () => {
      const normalizedUsername = username.trim();

      if (normalizedUsername.length === 0) {
        setUsers([]);
        setIsLoading(false);
        setIsError(false);
        return;
      }

      setIsLoading(true);
      setIsError(false);

      try {
        let resolvedUserId: number | undefined;

        if (isManagedByContext && typeof contextUserId === 'number') {
          resolvedUserId = contextUserId;
        }

        if (!resolvedUserId) {
          const publicUser =
            await userService.getPublicUserByUsername(normalizedUsername);
          resolvedUserId = publicUser.profile.id;
        }

        const response = await userService.getFollowers(resolvedUserId, {
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

    void loadFollowers();

    return () => {
      isCancelled = true;
    };
  }, [contextUserId, isManagedByContext, page, size, username]);

  return {
    users,
    isLoading,
    isError,
  };
}
