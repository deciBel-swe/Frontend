import { useCallback, useEffect, useMemo, useState } from 'react';

import type { UserCardData } from '@/components/ui/social/UserCard';
import { userService } from '@/services';

type UseUserCardHookParams = {
  user: UserCardData;
  onFollowToggle?: (userId: string) => void;
};

const toUserId = (value: string): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
};

export function useUserCardHook({
  user,
  onFollowToggle,
}: UseUserCardHookParams) {
  const [resolvedUser, setResolvedUser] = useState<UserCardData>(user);
  const [isHydrating, setIsHydrating] = useState(false);
  const [isFollowPending, setIsFollowPending] = useState(false);

  const userId = useMemo(() => toUserId(user.id), [user.id]);

  useEffect(() => {
    setResolvedUser(user);
  }, [user]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isCancelled = false;

    const hydrateCardData = async () => {
      setIsHydrating(true);

      try {
        const publicUser = await userService.getPublicUserById(userId);
        if (!isCancelled) {
          setResolvedUser((previous) => ({
            ...previous,
            username: publicUser.profile.username,
            avatarSrc: publicUser.profile.profilePic,
            followerCount: publicUser.profile.followerCount,
            isFollowing: publicUser.profile.isFollowing,
          }));
        }
      } catch {
        // Keep fallback values from parent list payload when hydration fails.
      } finally {
        if (!isCancelled) {
          setIsHydrating(false);
        }
      }
    };

    void hydrateCardData();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const handleFollowToggle = useCallback(
    async (nextFollowing: boolean) => {
      if (!userId || isFollowPending) {
        return;
      }

      const previousFollowing = resolvedUser.isFollowing ?? false;
      setResolvedUser((previous) => ({
        ...previous,
        isFollowing: nextFollowing,
      }));
      setIsFollowPending(true);

      try {
        const response = nextFollowing
          ? await userService.followUser(userId)
          : await userService.unfollowUser(userId);

        setResolvedUser((previous) => ({
          ...previous,
          isFollowing: response.isFollowing,
        }));
        onFollowToggle?.(resolvedUser.id);
      } catch {
        setResolvedUser((previous) => ({
          ...previous,
          isFollowing: previousFollowing,
        }));
      } finally {
        setIsFollowPending(false);
      }
    },
    [isFollowPending, onFollowToggle, resolvedUser.id, resolvedUser.isFollowing, userId]
  );

  return {
    user: resolvedUser,
    isHydrating,
    isFollowPending,
    handleFollowToggle,
  };
}
