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
  const { tracks, isLoading, isError } = useUserTracks();

  const feedTracks = tracks.map((track) => ({
    id: track.id,
    user: {
      name: track.artist.username,
      avatar: track.coverUrl,
    },
    postedText: 'posted a track' as const,
    timeAgo: '',
    track: {
      artist: track.artist.username,
      title: track.title,
      cover: track.coverUrl,
      duration: '',
    },
    waveform: generateWaveform(track.id),
  }));

  return { feedTracks, isLoading, isError };
}