import { useEffect, useState } from 'react';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import type { PlaybackAccess } from '@/features/player/contracts/playerContracts';
import { trackService } from '@/services';
import { formatDuration } from '@/utils/formatDuration';

const toPlaybackAccess = (
  access: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined
): PlaybackAccess => {
  if (access === 'BLOCKED' || access === 'PREVIEW') {
    return 'BLOCKED';
  }
  return 'PLAYABLE';
};

/**
 * useFeedTracks
 *
 * Fetches all tracks from the track service and maps them into the shape
 * expected by <TrackCard />.
 *
 * Waveform data is hydrated by the track service from waveformUrl payloads.
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

  // Canonical queue payload for current feed snapshot.
  const queueTracks = tracks.map((track) =>
    playerTrackMappers.fromTrackMetaData(track, {
      access: toPlaybackAccess(track.access),
    })
  );

  // Quick lookup for mapping feed rows to playback items.
  const queueMap = new Map(queueTracks.map((track) => [track.id, track]));

  // Map service DTOs into existing TrackCard presentation shape plus playback hooks.
  const feedTracks = tracks.map((track) => {
    const artistUsername =
      typeof track.artist === 'string'
        ? track.artist
        : (track.artist.username ?? 'unknown-artist');
    const artistDisplayName =
      typeof track.artist === 'string'
        ? track.artist
        : (track.artist.displayName?.trim() || artistUsername);
    const duration =
      track.durationSeconds && track.durationSeconds > 0
        ? formatDuration(track.durationSeconds)
        : '0:00';

    return {
      id: track.id,
      isPrivate: false,
      user: {
        username: artistUsername,
        displayName: artistDisplayName,
        avatar: '/images/default_song_image.png', //use this until API provides it
      },
      postedText: 'posted a track' as const,
      timeAgo: '',
      track: {
        id: track.id,
        artist: artistDisplayName,
        title: track.title,
        cover: track.coverUrl,
        duration,
        waveformUrl: track.waveformUrl,
        plays: track.playCount ?? 0,
        genre: track.genre,
        createdAt: track.uploadDate,
        isLiked: track.isLiked,
        isReposted: track.isReposted,
        likeCount: track.likeCount ?? 0,
        repostCount: track.repostCount ?? 0,
      },
      waveform: track.waveformData ?? [],
      playback: queueMap.get(track.id),
      queueTracks,
    };
  });

  return { feedTracks, isLoading, isError };
}
