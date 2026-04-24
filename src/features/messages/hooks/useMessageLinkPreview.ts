import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks';
import { playlistService, trackService } from '@/services';
import type { PlaylistData, TrackData } from '@/components/messages/types';
import {
  extractUrlsFromMessage,
  toMessagePlaylistData,
  toMessageTrackData,
} from '@/utils/messageSharing';

type ShareTarget =
  | { kind: 'track'; identifier: string }
  | { kind: 'playlist'; identifier: string }
  | { kind: 'station' }
  | null;

type LinkPreviewSource = {
  url: string;
  resourceKey: string;
};

type MessageLinkPreviewItem =
  | { type: 'track'; track: TrackData; source: LinkPreviewSource }
  | { type: 'playlist'; playlist: PlaylistData; source: LinkPreviewSource };

const parseShareTarget = (value: string): ShareTarget => {
  try {
    const url = new URL(value, 'https://decibel.local');
    const segments = url.pathname.split('/').filter(Boolean);

    if (segments.includes('stations')) {
      return { kind: 'station' };
    }

    if (segments.length >= 3 && segments[1] === 'sets') {
      return { kind: 'playlist', identifier: segments[2] };
    }

    if (segments.length >= 2) {
      return { kind: 'track', identifier: segments[1] };
    }

    return null;
  } catch {
    return null;
  }
};

export function useMessageLinkPreview(message: string) {
  const [previews, setPreviews] = useState<MessageLinkPreviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedMessage = useDebounce(message.trim(), 350);
  const previewCacheRef = useRef<
    Record<
      string,
      | { type: 'track'; track: TrackData }
      | { type: 'playlist'; playlist: PlaylistData }
    >
  >({});

  useEffect(() => {
    let isCancelled = false;

    const loadPreview = async () => {
      const normalizedMessage = debouncedMessage.trim();

      if (!normalizedMessage) {
        setPreviews([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const urls = extractUrlsFromMessage(normalizedMessage);

        if (urls.length === 0) {
          if (!isCancelled) {
            setPreviews([]);
          }
          return;
        }

        const entries = await Promise.all(
          urls.map(async (sourceUrl) => {
            const parsedTarget = parseShareTarget(sourceUrl);

            if (!parsedTarget || parsedTarget.kind === 'station') {
              return null;
            }

            try {
              if (parsedTarget.kind === 'track') {
                const resolvedTrack = await trackService.resolveTrackSlug(
                  parsedTarget.identifier
                );
                const cacheKey = `TRACK:${resolvedTrack.id}`;
                const cachedTrack = previewCacheRef.current[cacheKey];

                if (cachedTrack?.type === 'track') {
                  return {
                    type: 'track' as const,
                    track: cachedTrack.track,
                    source: { url: sourceUrl, resourceKey: cacheKey },
                  };
                }

                const track = await trackService.getTrackMetadata(
                  resolvedTrack.id
                );
                const nextTrack = toMessageTrackData(track);
                previewCacheRef.current[cacheKey] = {
                  type: 'track',
                  track: nextTrack,
                };
                return {
                  type: 'track' as const,
                  track: nextTrack,
                  source: { url: sourceUrl, resourceKey: cacheKey },
                };
              }

              const resolvedPlaylist =
                await playlistService.resolvePlaylistSlug(
                  parsedTarget.identifier
                );
              const cacheKey = `PLAYLIST:${resolvedPlaylist.resourceId}`;
              const cachedPlaylist = previewCacheRef.current[cacheKey];

              if (cachedPlaylist?.type === 'playlist') {
                return {
                  type: 'playlist' as const,
                  playlist: cachedPlaylist.playlist,
                  source: { url: sourceUrl, resourceKey: cacheKey },
                };
              }

              const playlist = await playlistService.getPlaylist(
                resolvedPlaylist.resourceId
              );
              const nextPlaylist = toMessagePlaylistData(playlist);
              previewCacheRef.current[cacheKey] = {
                type: 'playlist',
                playlist: nextPlaylist,
              };
              return {
                type: 'playlist' as const,
                playlist: nextPlaylist,
                source: { url: sourceUrl, resourceKey: cacheKey },
              };
            } catch {
              return null;
            }
          })
        );

        const nextPreviews = entries.filter(
          (entry): entry is MessageLinkPreviewItem => entry !== null
        );

        if (!isCancelled) {
          setPreviews(nextPreviews);
        }
      } catch {
        if (!isCancelled) {
          setPreviews([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPreview();

    return () => {
      isCancelled = true;
    };
  }, [debouncedMessage]);

  return {
    previews,
    isLoading,
  };
}
