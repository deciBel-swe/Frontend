'use client';

import { useEffect, useState } from 'react';
import type { TrackCardProps } from '@/components/tracks/track-card';
import { discoveryService } from '@/services';
import type { TrendingTrackResponseDTO } from '@/types/discovery';
import { formatDuration } from '@/utils/formatDuration';

export type TrendingItem = { kind: 'track'; id: string; card: TrackCardProps };

type UseTrendingOptions = {
  genre?: string;
  page?: number;
  size?: number;
  limit?: number;
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

export function useTrendingTracks(options: UseTrendingOptions = {}) {
  const { genre, page, size, limit } = options;
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLast, setIsLast] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const requestParams: Record<string, unknown> = {
          genre: genre ?? undefined,
        };

        if (typeof page === 'number') {
          requestParams.page = page;
        }

        if (typeof size === 'number') {
          requestParams.size = size;
        } else if (typeof limit === 'number') {
          requestParams.limit = limit;
        }

        const response = await discoveryService.getTrending(
          requestParams as Parameters<typeof discoveryService.getTrending>[0]
        );

        if (isCancelled) return;

        const content = response.content ?? [];

        const mappedTracks = content.map((track: TrendingTrackResponseDTO) => {
          const username =
            track.artist?.username?.trim() ||
            track.artist?.displayName?.trim() ||
            'unknown';
          const displayName = track.artist?.displayName?.trim() || username;
          const avatar =
            track.artist?.avatarUrl || '/images/default_song_image.png';
          const trackUrl = track.trackUrl ?? track.trackPreviewUrl ?? '';
          const durationSeconds = track.trackDurationSeconds ?? 0;

          const card: TrackCardProps = {
            trackId: String(track.id),
            user: {
              username,
              displayName,
              avatar,
            },
            showHeader: true,
            track: {
              id: track.id,
              trackSlug: track.trackSlug ?? undefined,
              artistUsername: username,
              artist: {
                username,
                displayName,
                avatar,
              },
              title: track.title,
              cover: track.coverUrl || '/images/default_song_image.png',
              duration:
                durationSeconds > 0 ? formatDuration(durationSeconds) : '0:00',
              waveformUrl: track.waveformUrl ?? undefined,
              plays: track.playCount,
              comments: track.commentCount,
              genre: track.genre,
              isLiked: track.isLiked,
              isReposted: track.isReposted,
              likeCount: track.likeCount,
              repostCount: track.repostCount,
              createdAt: asIsoDate(track.uploadDate),
            },
            playback: {
              id: track.id,
              title: track.title,
              artistName: displayName,
              trackUrl,
              access: track.access === 'PREVIEW' ? 'BLOCKED' : track.access,
              durationSeconds,
            },
            waveform: [],
          };

          return { kind: 'track' as const, id: `track-${track.id}`, card };
        });

        const limited =
          typeof size === 'number'
            ? mappedTracks
            : typeof limit === 'number'
              ? mappedTracks.slice(0, limit)
              : mappedTracks;

        const isLastPage =
          typeof response.isLast === 'boolean'
            ? response.isLast
            : typeof response.pageNumber === 'number' &&
                typeof response.totalPages === 'number'
              ? response.pageNumber >= response.totalPages - 1
              : typeof response.totalElements === 'number' &&
                  typeof size === 'number'
                ? response.totalElements <= size
                : typeof response.totalElements === 'number' &&
                    typeof limit === 'number'
                  ? response.totalElements <= limit
                  : limited.length <
                    (typeof size === 'number'
                      ? size
                      : typeof limit === 'number'
                        ? limit
                        : Number.POSITIVE_INFINITY);

        setItems(limited);
        setIsLast(isLastPage);
      } catch (error) {
        console.error('Failed to load trending resources', error);
        if (!isCancelled) {
          setItems([]);
          setIsLast(true);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [genre, limit, page, size]);

  return { items, isLoading, isError, isLast };
}
