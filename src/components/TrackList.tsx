'use client';

import TrackCard from '@/components/TrackCard';
import { useUserTracks } from '@/hooks/useUserTracks';

type TrackListProps = {
  userId?: number;
  username?: string;
  artistAvatar?: string;
  // NEW prop to control showing CompactTrackList inside each TrackCard
  showTrackList?: boolean;
};

export default function TrackList({
  userId,
  username,
  artistAvatar,
  showTrackList = false, 
}: TrackListProps) {
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
            trackId={String(track.id)}
            isPrivate={false}
            user={{
              name: artistName,
              avatar: artistAvatar || track.coverUrl, //if artist avatar missing use that of track
            }}
            postedText="posted a track"
            // timeAgo=""
            showTrackList={showTrackList}
            track={{
              id: track.id,
              artist: artistName,
              title: track.title,
              cover: track.coverUrl,
              duration: '',
              createdAt: track.releaseDate,
            }}
            waveform={track.waveformData ?? []}
          />
        );
      })}
    </>
  );
}
