import { useCallback, useEffect, useState } from 'react';

import type { TrackListItem } from '@/components/tracks/TrackList';
import type { PlaybackAccess } from '@/features/player/contracts/playerContracts';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { useInfinitePaginatedResource } from '@/hooks/useInfinitePaginatedResource';
import { trackService, userService } from '@/services';
import { formatDuration } from '@/utils/formatDuration';

const normalizeUsername = (value: string | undefined): string =>
  decodeURIComponent(value ?? '')
    .trim()
    .toLowerCase();

const toPlaybackAccess = (
  access: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined
): PlaybackAccess | undefined => {
  if (!access) {
    return undefined;
  }

  if (access === 'BLOCKED' || access === 'PREVIEW') {
    return 'BLOCKED';
  }

  return 'PLAYABLE';
};

const asIsoDate = (value: unknown): string | undefined => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return undefined;
};

type UseLikedTracksOptions = {
  forCurrentUser?: boolean;
  page?: number;
  size?: number;
  infinite?: boolean;
};

export function useLikedTracks(
  username: string,
  options: UseLikedTracksOptions = {}
) {
  const {
    forCurrentUser = false,
    page = 0,
    size = 10,
    infinite = false,
  } = options;
  const profileContext = useProfileOwnerContext();
  const [tracks, setTracks] = useState<TrackListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const isManagedByContext =
    normalizeUsername(profileContext?.routeUsername) ===
    normalizeUsername(username);
  const isOwner =
    forCurrentUser || (isManagedByContext && Boolean(profileContext?.isOwner));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleUpdate = () => {
      setRefreshIndex((prev) => prev + 1);
    };

    window.addEventListener('track-updated', handleUpdate);
    return () => {
      window.removeEventListener('track-updated', handleUpdate);
    };
  }, []);

  const mapLikedPage = useCallback(
    async (pageNumber: number, pageSize: number) => {
      const artistDisplayNameLookups = new Map<
        string,
        Promise<string | undefined>
      >();

      const resolveArtistDisplayName = (
        artistUsername: string,
        fallbackDisplayName: string | undefined
      ): Promise<string | undefined> => {
        const normalizedFallback = fallbackDisplayName?.trim();
        if (normalizedFallback) {
          return Promise.resolve(normalizedFallback);
        }

        const normalizedArtistUsername = artistUsername.trim();
        if (
          normalizedArtistUsername.length === 0 ||
          normalizedArtistUsername === 'unknown'
        ) {
          return Promise.resolve(undefined);
        }

        const cachedLookup = artistDisplayNameLookups.get(
          normalizedArtistUsername
        );
        if (cachedLookup) {
          return cachedLookup;
        }

        const lookup = (async () => {
          try {
            const publicUser = await userService.getPublicUserByUsername(
              normalizedArtistUsername
            );
            return publicUser.profile.displayName?.trim() || undefined;
          } catch {
            return undefined;
          }
        })();

        artistDisplayNameLookups.set(normalizedArtistUsername, lookup);
        return lookup;
      };

      const response = isOwner
        ? await trackService.getMyLikedTracks({
            page: pageNumber,
            size: pageSize,
          })
        : await trackService.getUserLikedTracks(username, {
            page: pageNumber,
            size: pageSize,
          });
      const likedTracks = response.content ?? [];

      const items = await Promise.all(
        likedTracks.map(async (track) => {
          let metadata: Awaited<
            ReturnType<typeof trackService.getTrackMetadata>
          > | null = null;

          try {
            metadata = await trackService.getTrackMetadata(track.id);
          } catch {
            metadata = null;
          }

          const artistUsername =
            track.artist?.username ||
            metadata?.artist?.username ||
            track.artist?.displayName ||
            'unknown';
          const artistDisplayName = await resolveArtistDisplayName(
            artistUsername,
            track.artist?.displayName || metadata?.artist?.displayName
          );
          const durationSeconds = metadata?.durationSeconds;

          return {
            trackId: String(track.id),
            user: {
              username: artistUsername,
              displayName: artistDisplayName,
              avatar:
                metadata?.artist?.avatarUrl ??
                track.artist?.avatarUrl ??
                '/images/default_avatar.png',
            },
            postedText: 'liked a track',
            track: {
              id: track.id,
              artist: {
                username: artistUsername,
                displayName: artistDisplayName,
                avatar:
                  metadata?.artist?.avatarUrl ??
                  track.artist?.avatarUrl ??
                  '/images/default_avatar.png',
              },
              title: track.title,
              cover: metadata?.coverUrl ?? track.coverUrl,
              duration: durationSeconds ? formatDuration(durationSeconds) : '',
              plays: track.playCount,
              createdAt: asIsoDate(track.uploadDate ?? track.releaseDate),
              genre: track.genre,
              durationSeconds,
              isLiked: track.isLiked,
              isReposted: track.isReposted,
              likeCount: track.likeCount,
              repostCount: track.repostCount,
              isPrivate: metadata?.isPrivate,
              secretToken: metadata?.secretToken?.trim() || '',
            },
            trackUrl: metadata?.trackUrl ?? track.trackUrl,
            access: toPlaybackAccess(metadata?.access),
            waveform: metadata?.waveformData ?? [],
          } satisfies TrackListItem;
        })
      );

      return {
        items,
        pageNumber: response.pageNumber,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        isLast: response.isLast,
        last: Boolean(response.last),
      };
    },
    [isOwner, username]
  );

  const {
    items: infiniteTracks,
    hasMore,
    isPaginating,
    isInitialLoading,
    isError: isInfiniteError,
    sentinelRef,
    loadNextPage,
  } = useInfinitePaginatedResource<TrackListItem>({
    enabled: infinite,
    pageSize: size,
    resetKey: [
      username.trim().toLowerCase(),
      String(forCurrentUser),
      String(isOwner),
      String(size),
      String(refreshIndex),
    ].join('|'),
    fetchPage: mapLikedPage,
    dedupeBy: (item) => item.trackId,
    initialErrorMessage: 'Failed to load liked tracks. Please try again later.',
  });

  useEffect(() => {
    if (infinite) {
      return;
    }

    let isCancelled = false;

    const loadLikedTracks = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await mapLikedPage(page, size);

        if (!isCancelled) {
          setTracks(response.items);
        }
      } catch {
        if (!isCancelled) {
          setTracks([]);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadLikedTracks();

    return () => {
      isCancelled = true;
    };
  }, [infinite, isOwner, mapLikedPage, page, refreshIndex, size]);

  return {
    tracks: infinite ? infiniteTracks : tracks,
    isLoading: infinite ? isInitialLoading : isLoading,
    isError: infinite ? isInfiniteError : isError,
    isOwner,
    hasMore: infinite ? hasMore : false,
    isPaginating: infinite ? isPaginating : false,
    sentinelRef: infinite ? sentinelRef : undefined,
    loadNextPage: infinite ? loadNextPage : undefined,
  };
}
