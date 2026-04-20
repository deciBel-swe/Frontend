'use client';

import { useEffect, useState } from 'react';
import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import type { TrackCardProps } from '@/components/tracks/track-card';
import { useAuth } from '@/features/auth';
import {
  mapPlaylistResourceToPlaylistCard,
  mapTrackResourceToTrackCard,
} from '@/features/search/mappers/searchResultMappers';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { userService } from '@/services';

const normalizeIdentity = (value: string | undefined): string =>
  (value ?? '').trim().toLowerCase();

type RepostedByShape = {
  username?: string;
  displayName?: string;
};

export type UserRepostPageItem =
  | {
      kind: 'track';
      id: string;
      card: TrackCardProps;
    }
  | {
      kind: 'playlist';
      id: string;
      card: PlaylistHorizontalProps;
    };

const toRepostedBy = (
  repostedBy: RepostedByShape | undefined,
  fallbackUsername: string
): TrackCardProps['repostedBy'] | undefined => {
  if (repostedBy?.username) {
    return {
      username: repostedBy.username,
      displayName: repostedBy.displayName,
    };
  }

  const normalizedFallback = fallbackUsername.trim();
  if (!normalizedFallback) {
    return undefined;
  }

  return {
    username: normalizedFallback,
    displayName: undefined,
  };
};

export function useUserRepostPage(routeUsername?: string) {
  const { user } = useAuth();
  const ownerContext = useProfileOwnerContext();
  const [items, setItems] = useState<UserRepostPageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadReposts = async () => {
      const targetUsername =
        routeUsername?.trim() ||
        ownerContext?.routeUsername?.trim() ||
        user?.username?.trim() ||
        '';

      if (!targetUsername) {
        if (!isCancelled) {
          setItems([]);
          setIsLoading(false);
          setIsError(false);
        }
        return;
      }

      setIsLoading(true);
      setIsError(false);

      try {
        let targetUserId: number | undefined;

        const contextUsername = ownerContext?.routeUsername;
        const contextUserId = ownerContext?.publicUser?.profile.id;

        if (
          contextUserId &&
          normalizeIdentity(contextUsername) === normalizeIdentity(targetUsername)
        ) {
          targetUserId = contextUserId;
        } else if (
          user?.id !== undefined &&
          normalizeIdentity(user.username) === normalizeIdentity(targetUsername)
        ) {
          targetUserId = user.id;
        } else {
          const publicUser = await userService.getPublicUserByUsername(targetUsername);
          targetUserId = publicUser.profile.id;
        }

        if (!targetUserId) {
          throw new Error('Unable to resolve repost owner id.');
        }

        const response = await userService.getUserReposts(targetUserId, {
          page: 0,
          size: 100,
        });

        const mappedItems = response.content.flatMap((resource, index) => {
          const repostedBy = (
            resource as { repostedBy?: RepostedByShape }
          ).repostedBy;

          if (resource.resourceType === 'TRACK') {
            const trackCard = mapTrackResourceToTrackCard(resource);
            if (!trackCard) {
              return [];
            }

            return [
              {
                kind: 'track',
                id: `track-${resource.resourceId}-${index}`,
                card: {
                  ...trackCard,
                  postedText: 'reposted a track',
                  repostedBy: toRepostedBy(repostedBy, targetUsername),
                },
              } satisfies UserRepostPageItem,
            ];
          }

          if (resource.resourceType === 'PLAYLIST') {
            const playlistCard = mapPlaylistResourceToPlaylistCard(resource);
            if (!playlistCard) {
              return [];
            }

            return [
              {
                kind: 'playlist',
                id: `playlist-${resource.resourceId}-${index}`,
                card: {
                  ...playlistCard,
                  postedText: 'reposted a set',
                },
              } satisfies UserRepostPageItem,
            ];
          }

          return [];
        });

        if (!isCancelled) {
          setItems(mappedItems);
        }
      } catch {
        if (!isCancelled) {
          setItems([]);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadReposts();

    return () => {
      isCancelled = true;
    };
  }, [
    ownerContext?.publicUser?.profile.id,
    ownerContext?.routeUsername,
    routeUsername,
    user?.id,
    user?.username,
  ]);

  return {
    items,
    isLoading,
    isError,
  };
}
