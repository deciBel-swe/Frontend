import { useEffect, useState } from 'react';

import type { TrackListItem } from '@/components/TrackList';
import type { PlaybackAccess } from '@/features/player/contracts/playerContracts';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { trackService, userService } from '@/services';
import { formatDuration } from '@/utils/formatDuration';

const normalizeUsername = (value: string | undefined): string =>
  decodeURIComponent(value ?? '').trim().toLowerCase();

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
};

export function useLikedTracks(
  username: string,
  options: UseLikedTracksOptions = {}
) {
  const profileContext = useProfileOwnerContext();
  const [tracks, setTracks] = useState<TrackListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const isManagedByContext =
    normalizeUsername(profileContext?.routeUsername) ===
    normalizeUsername(username);
  const isOwner =
    options.forCurrentUser ||
    (isManagedByContext && Boolean(profileContext?.isOwner));

  useEffect(() => {
    let isCancelled = false;

    const loadLikedTracks = async () => {
      setIsLoading(true);
      setIsError(false);
      const artistDisplayNameLookups = new Map<string, Promise<string | undefined>>();

      const resolveArtistDisplayName = (
        artistUsername: string,
        fallbackDisplayName: string | undefined
      ): Promise<string | undefined> => {
        const normalizedFallback = fallbackDisplayName?.trim();
        if (normalizedFallback) {
          return Promise.resolve(normalizedFallback);
        }

        const normalizedUsername = artistUsername.trim();
        if (normalizedUsername.length === 0 || normalizedUsername === 'unknown') {
          return Promise.resolve(undefined);
        }

        const cachedLookup = artistDisplayNameLookups.get(normalizedUsername);
        if (cachedLookup) {
          return cachedLookup;
        }

        const lookup = (async () => {
          try {
            const publicUser = await userService.getPublicUserByUsername(normalizedUsername);
            return publicUser.profile.displayName?.trim() || undefined;
          } catch {
            return undefined;
          }
        })();

        artistDisplayNameLookups.set(normalizedUsername, lookup);
        return lookup;
      };

      try {
        if (!isOwner) {
          if (!isCancelled) {
            setTracks([]);
          }
          return;
        }

        const response = await trackService.getMyLikedTracks({ page: 0, size: 100 });
        const likedTracks = response.content ?? [];

        const mappedTracks = await Promise.all(
          likedTracks.map(async (track) => {
            let metadata:
              | Awaited<ReturnType<typeof trackService.getTrackMetadata>>
              | null = null;

            try {
              metadata = await trackService.getTrackMetadata(track.id);
            } catch {
              metadata = null;
            }

            const artistUsername =
              track.artist?.username ||
              metadata?.artist.username ||
              track.artist?.displayName ||
              'unknown';
            const artistDisplayName = await resolveArtistDisplayName(
              artistUsername,
              track.artist?.displayName || metadata?.artist.displayName
            );
            const durationSeconds = metadata?.durationSeconds;

            return {
              trackId: String(track.id),
              user: {
                username: artistUsername,
                displayName: artistDisplayName,
                avatar: metadata?.coverUrl ?? track.coverUrl,
              },
              postedText: 'liked a track',
              track: {
                id: track.id,
                artist: artistDisplayName || artistUsername,
                title: track.title,
                cover: metadata?.coverUrl ?? track.coverUrl,
                duration: durationSeconds ? formatDuration(durationSeconds) : '',
                plays: track.playCount,
                createdAt: asIsoDate(track.releaseDate),
                genre: track.genre,
                durationSeconds,
                isLiked: track.isLiked,
                isReposted: track.isReposted,
                likeCount: track.likeCount,
                repostCount: track.repostCount,
              },
              trackUrl: metadata?.trackUrl ?? track.trackUrl,
              access: toPlaybackAccess(metadata?.access),
              waveform: metadata?.waveformData ?? [],
            } satisfies TrackListItem;
          })
        );

        if (!isCancelled) {
          setTracks(mappedTracks);
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
  }, [isOwner]);

  return {
    tracks,
    isLoading,
    isError,
    isOwner,
  };
}
