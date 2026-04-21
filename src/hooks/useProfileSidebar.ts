import { useMemo } from 'react';

import type { PlayerTrack } from '@/features/player/contracts/playerContracts';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { useLikedTracks } from '@/hooks/useLikedTracks';

const compactCount = (value: number | undefined): string => {
  if (!value || value <= 0) {
    return '0';
  }

  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

export function useProfileSidebar(username: string) {
  const { tracks, isLoading, isError } = useLikedTracks(username);

  const likedRows = useMemo(
    () =>
      tracks.map((track) => {
        const playback: PlayerTrack | undefined = track.playback ?? (
          track.trackUrl
            ? playerTrackMappers.fromAdapterInput(
                {
                  id: track.track.id,
                  title: track.track.title,
                  trackUrl: track.trackUrl,
                  artist: track.track.artist,
                  coverUrl: track.track.cover,
                  waveformData: track.waveform,
                  durationSeconds: track.track.durationSeconds,
                },
                { access: track.access ?? 'PLAYABLE' }
              )
            : undefined
        );

        return {
          trackId: track.track.id,
          image: track.track.cover,
          artist:
            track.track.artist.displayName || track.track.artist.username,
          title: track.track.title,
          playback,
          stats: {
            plays: compactCount(track.track.plays),
            likes: compactCount(track.track.likeCount),
            reposts: compactCount(track.track.repostCount),
            comments: compactCount(track.track.comments),
          },
        };
      }),
    [tracks]
  );

  return {
    likedRows,
    likesCount: likedRows.length,
    isLoading,
    isError,
  };
}
