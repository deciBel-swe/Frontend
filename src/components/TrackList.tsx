'use client';

import TrackCard from '@/components/TrackCard';
import { useUserTracks } from '@/hooks/useUserTracks';

type TrackListProps = {
  userId?: number;
  username?: string;
};

const parseWaveform = (value: string | undefined): number[] => {
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

export default function TrackList({ userId, username }: TrackListProps) {
  const { tracks, isLoading, isError } = useUserTracks({ userId, username });

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-default rounded-lg h-40 animate-pulse"
          />
        ))}
      </>
    );
  }

  if (isError) {
    return (
      <p className="text-text-muted text-sm">
        Failed to load tracks. Please try again later.
      </p>
    );
  }

  if (tracks.length === 0) {
    return <p className="text-text-muted text-sm">No tracks published yet.</p>;
  }

  return (
    <>
      {tracks.map((track) => {
        const artistName =
          typeof track.artist === 'string'
            ? track.artist
            : track.artist.username;

        return (
          <TrackCard
            key={track.id}
            user={{
              name: artistName,
              avatar: track.coverUrl,
            }}
            postedText="posted a track"
            timeAgo=""
            track={{
              artist: artistName,
              title: track.title,
              cover: track.coverUrl,
              duration: '',
            }}
            waveform={parseWaveform(track.waveformData)}
          />
        );
      })}
    </>
  );
}
