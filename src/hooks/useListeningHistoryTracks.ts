import { useEffect, useState } from 'react';

import type { TrackListItem } from '@/components/TrackList';
import type { PlaybackAccess } from '@/features/player/contracts/playerContracts';
import { playbackService, trackService} from '@/services';
import { formatDuration } from '@/utils/formatDuration';
import { useAuth } from '.';

type UseListeningHistoryTracksParams = {
  page?: number;
  size?: number;
};

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

export function useListeningHistoryTracks({
  page = 0,
  size = 20,
}: UseListeningHistoryTracksParams = {}) {
  const [tracks, setTracks] = useState<TrackListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const {isAuthenticated} = useAuth();
  useEffect(() => {
    let isCancelled = false;
    if(!isAuthenticated) {
      setTracks([]);
      setIsLoading(false);
      setIsError(false);
      return;
    }
    const loadHistory = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await playbackService.getListeningHistory({ page, size });
        const historyItems = response.content ?? [];

        const mappedTracks: Array<TrackListItem | null> = await Promise.all(
          historyItems.map(async (item) => {
            if (typeof item.id !== 'number') {
              return null;
            }

            let metadata:
              | Awaited<ReturnType<typeof trackService.getTrackMetadata>>
              | null = null;

            try {
              metadata = await trackService.getTrackMetadata(item.id);
            } catch {
              metadata = null;
            }

            const artistUsername = metadata?.artist.username ?? 'unknown';
            const artistDisplayName = metadata?.artist.displayName ?? 'unknown';
            const title = metadata?.title ?? item.title ?? `Track ${item.id}`;
            const durationSeconds = metadata?.durationSeconds;

            return {
              trackId: String(item.id),
              user: {
                username: artistUsername,
                displayName: artistDisplayName,
                avatar: metadata?.coverUrl ?? '/images/default_song_image.png',
              },
              postedText: 'played a track',
              track: {
                id: item.id,
                artist: artistDisplayName || artistUsername,
                title,
                cover: metadata?.coverUrl ?? '/images/default_song_image.png',
                duration: durationSeconds ? formatDuration(durationSeconds) : '',
                plays: metadata?.playCount,
                createdAt: asIsoDate(metadata?.releaseDate),
                genre: metadata?.genre,
                durationSeconds,
                isLiked: metadata?.isLiked,
                isReposted: metadata?.isReposted,
                likeCount: metadata?.likeCount,
                repostCount: metadata?.repostCount,
              },
              trackUrl: metadata?.trackUrl,
              access: toPlaybackAccess(metadata?.access),
              waveform: metadata?.waveformData ?? [],
            } satisfies TrackListItem;
          })
        );

        if (!isCancelled) {
          setTracks(
            mappedTracks.filter((item): item is TrackListItem => item !== null)
          );
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

    void loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, page, size]);

  return {
    tracks,
    isLoading,
    isError,
  };
}
