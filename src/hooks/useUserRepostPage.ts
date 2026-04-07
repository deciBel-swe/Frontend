'use client';

import { useEffect, useState } from 'react';
import type { TrackListItem } from '@/components/TrackList';
import type { PlaybackAccess } from '@/features/player/contracts/playerContracts';
import { useAuth } from '@/features/auth';
import { trackService } from '@/services';
import { formatDuration } from '@/utils/formatDuration';

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

export function useUserRepostPage() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<TrackListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadRepostedTracks = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await trackService.getMyRepostedTracks({ page: 0, size: 100 });
        const repostedTracks = response.content ?? [];

        const mappedTracks = await Promise.all(
          repostedTracks.map(async (track) => {
            let metadata:
              | Awaited<ReturnType<typeof trackService.getTrackMetadata>>
              | null = null;
            try {
              metadata = await trackService.getTrackMetadata(track.id);
            } catch {
              metadata = null;
            }

            const artistName =
              (typeof track.artist === 'string'
                ? track.artist
                : track.artist?.username) ??
              metadata?.artist.username ??
              'unknown';

            const durationSeconds = metadata?.durationSeconds;

            return {
              trackId: String(track.id),
              user: {
                username: artistName,
                displayName: track.artist?.displayName,
                avatar: metadata?.coverUrl ?? track.coverUrl,
              },
              repostedBy: user?.username
                ? {
                    username: user.username,
                    displayName: user.displayName ?? undefined,
                  }
                : undefined,
              track: {
                id: track.id,
                artist: artistName,
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

    void loadRepostedTracks();

    return () => {
      isCancelled = true;
    };
  }, [user?.displayName, user?.username]);

  return {
    tracks,
    isLoading,
    isError,
  };
}
