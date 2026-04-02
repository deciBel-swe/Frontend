import { useEffect, useState } from 'react';
import { trackService } from '@/services';

/**
 * useFeedTracks
 *
 * Fetches all tracks from the track service and maps them into the shape
 * expected by <TrackCard />.
 *
 * Waveform data is derived deterministically per track id until the real
 * waveform endpoint is wired up — at that point, replace `generateWaveform`
 * with a fetch to `track.waveformUrl`.
 *
 * @example
 * const { feedTracks, isLoading, isError } = useFeedTracks();
 */
export function useFeedTracks() {
  const [tracks, setTracks] = useState<
    Awaited<ReturnType<typeof trackService.getAllTracks>>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

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

  useEffect(() => {
    let isCancelled = false;

    const fetchTracks = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const data = await trackService.getAllTracks();
        if (!isCancelled) {
          setTracks(data);
        }
      } catch {
        if (!isCancelled) {
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchTracks();

    return () => {
      isCancelled = true;
    };
  }, [refreshIndex]);

  const parseWaveform = (value: string | null | undefined): number[] => {
    if (!value || value.trim().length === 0) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((entry) => Number(entry))
        .filter((entry) => Number.isFinite(entry))
        .map((entry) => Math.max(0, Math.min(1, entry)));
    } catch {
      return [];
    }
  };

  const feedTracks = tracks.map((track) => {
    const artistName =
      typeof track.artist === 'string' ? track.artist : track.artist.username;

    return {
      id: track.id,
      isPrivate: false,
      user: {
        name: artistName,
        avatar: '/images/default_song_image.png', //use this until API provides it
      },
      postedText: 'posted a track' as const,
      timeAgo: '',
      track: {
        id: track.id,
        artist: artistName,
        title: track.title,
        cover: track.coverUrl,
        duration: '',
      },
      waveform: parseWaveform(track.waveformData),
    };
  });

  return { feedTracks, isLoading, isError };
}
