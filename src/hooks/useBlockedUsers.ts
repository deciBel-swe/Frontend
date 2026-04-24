import { useCallback, useEffect, useState } from 'react';

import { userService } from '@/services';
import type { SearchUser } from '@/types/user';

type BlockedUserItem = {
  id: number;
  username: string;
  avatarUrl?: string;
};

const toBlockedUserItem = (user: SearchUser): BlockedUserItem | null => {
  if (typeof user.id !== 'number' || !user.username) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl ?? undefined,
  };
};

export function useBlockedUsers(page = 0, size = 48) {
  const [users, setUsers] = useState<BlockedUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const loadBlockedUsers = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await userService.getBlockedUsers({ page, size });
        const mappedUsers = response.content
          .map(toBlockedUserItem)
          .filter((entry): entry is BlockedUserItem => entry !== null);

        if (!isCancelled) {
          setUsers(mappedUsers);
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

    void loadBlockedUsers();

    return () => {
      isCancelled = true;
    };
  }, [page, refreshIndex, size]);

  const refresh = useCallback(() => {
    setRefreshIndex((previous) => previous + 1);
  }, []);

  const unblockUser = useCallback(async (userId: number) => {
    setPendingIds((previous) => [...previous, userId]);

    try {
      await userService.unblockUser(userId);
      setUsers((previous) => previous.filter((user) => user.id !== userId));
    } finally {
      setPendingIds((previous) => previous.filter((id) => id !== userId));
    }
  }, []);

  const isUserBlocked = useCallback(
    (userId: number) => users.some((user) => user.id === userId),
    [users]
  );

  return {
    users,
    isLoading,
    isError,
    pendingIds,
    unblockUser,
    isUserBlocked,
    refresh,
  };
}
