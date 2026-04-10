import { useEffect, useState } from 'react';

import type { UserCardData } from '@/features/social/components/UserCard';
import { userService } from '@/services';
import type { SearchUser } from '@/types/user';

type UseSuggestedUsersParams = {
  size?: number;
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

export function useSuggestedUsers({ size = 24 }: UseSuggestedUsersParams = {}) {
  const [users, setUsers] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
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
  }, [size]);

  return {
    users,
    isLoading,
    isError,
  };
}
