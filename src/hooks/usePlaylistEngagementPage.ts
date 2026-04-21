import { useEffect, useState } from 'react';
import type { UserCardData } from '@/features/social/components/UserCard';
import { feedService } from '@/services';
import type { FeedItemDTO } from '@/types/discovery';

type EngagementType = 'likes' | 'reposts';

type UsePlaylistEngagementPageParams = {
  playlistId: string;
  type: EngagementType;
  page?: number;
  size?: number;
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
}: UsePlaylistEngagementPageParams) {
  const [users, setUsers] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let isCancelled = false;

    const loadPageData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const parsedPlaylistId = Number(playlistId);
        if (!Number.isInteger(parsedPlaylistId) || parsedPlaylistId <= 0) {
          throw new Error('Invalid playlist id');
        }

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

          isLast = response.isLast;
          currentPage += 1;
          safety += 1;
        }

        const allUsers = [...actorsById.values()].map(toUserCardData);
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
  }, [page, playlistId, size, type]);

  return {
    users,
    isLoading,
    isError,
    page,
    size,
    totalElements,
    totalPages,
  };
}
