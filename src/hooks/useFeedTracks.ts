import { useUserTracks } from '@/hooks/useUserTracks';
import { generateWaveform } from '@/utils/waveform';

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
  const { tracks, isLoading, isError } = useUserTracks(7);

  const parseWaveform = (value: string | undefined, fallbackId: number) => {
    if (!value || value.trim().length === 0) {
      return generateWaveform(fallbackId);
    }

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const numeric = parsed
          .map((entry) => Number(entry))
          .filter((entry) => Number.isFinite(entry))
          .map((entry) => Math.max(0, Math.min(1, entry)))
          .map((entry) => Math.pow(entry, 0.5));

        if (numeric.length === 0) {
          return generateWaveform(fallbackId);
        }

        const targetCount = 200;
        if (numeric.length === targetCount) {
          return numeric;
        }

        if (numeric.length < targetCount) {
          const lastIndex = numeric.length - 1;
          return Array.from({ length: targetCount }, (_, index) => {
            const t = (index / (targetCount - 1)) * lastIndex;
            const left = Math.floor(t);
            const right = Math.min(lastIndex, left + 1);
            const weight = t - left;
            return numeric[left] * (1 - weight) + numeric[right] * weight;
          });
        }

        const step = numeric.length / targetCount;
        return Array.from({ length: targetCount }, (_, index) => {
          const start = Math.floor(index * step);
          const end = Math.floor((index + 1) * step);
          const slice = numeric.slice(start, Math.max(start + 1, end));
          const avg =
            slice.reduce((sum, value) => sum + value, 0) / slice.length;
          return avg;
        });
      }
    } catch {
      // Fall back to deterministic placeholder waveform.
    }

    return generateWaveform(fallbackId);
  };

  const feedTracks = tracks.map((track) => {
    const artistName =
      typeof track.artist === 'string' ? track.artist : track.artist.username;

    return {
      id: track.id,
      user: {
        name: artistName,
        avatar: track.coverUrl,
      },
      postedText: 'posted a track' as const,
      timeAgo: '',
      track: {
        artist: artistName,
        title: track.title,
        cover: track.coverUrl,
        duration: '',
      },
      waveform: parseWaveform(track.waveformData, track.id),
    };
  });

  return { feedTracks, isLoading, isError };
}
