import { useEffect, useState } from 'react';

import type { UserCardData } from '@/features/social/components/UserCard';
import { trackService, userService } from '@/services';
import type { SearchUser } from '@/types/user';

type EngagementType = 'likes' | 'reposts';

type UseTrackEngagementPageParams = {
  trackId: string;
  type: EngagementType;
  page?: number;
  size?: number;
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
  size = 48,
}: UseTrackEngagementPageParams) {
  const [users, setUsers] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadPageData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const parsedTrackId = Number(trackId);
        if (!Number.isInteger(parsedTrackId) || parsedTrackId <= 0) {
          throw new Error('Invalid track id');
        }

        if (isCancelled) {
          return;
        }

        let engagementUsers: LooseUser[] = [];

        if (type === 'likes') {
          try {
            const likedUsersResponse = await userService.getUsersWhoLikedTrack(
              parsedTrackId,
              { page, size }
            );
            engagementUsers = (likedUsersResponse.content ?? []) as LooseUser[];
          } catch {
            engagementUsers = [];
          }
        } else {
          try {
            const repostUsersResponse = await userService.getUsersWhoRepostedTrack(
              parsedTrackId,
              { page, size }
            );
            engagementUsers = (repostUsersResponse.content ?? []) as LooseUser[];
          } catch {
            try {
              const fallbackRepostUsers = await trackService.getRepostUsers(parsedTrackId, {
                page,
                size,
              });
              engagementUsers = (fallbackRepostUsers.content ?? []) as LooseUser[];
            } catch {
              engagementUsers = [];
            }
          }
        }

        setUsers(engagementUsers.map(toUserCardData));
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
  }, [page, size, trackId, type]);

  return {
    users,
    isLoading,
    isError,
  };
}
