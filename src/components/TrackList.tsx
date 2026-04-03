'use client';

import TrackCard from '@/components/TrackCard';
import { useUserTracks } from '@/hooks/useUserTracks';

export type TrackListItem = {
  trackId: string;
  user: { name: string; avatar: string };
  postedText?: string;
  repostedBy?: string;
  track: {
    id: number;
    artist: string;
    title: string;
    cover: string;
    duration: string;
    plays?: number;
    comments?: number;
    createdAt?: string;
    genre?: string;
    durationSeconds?: number;
  };
  waveform: number[];
};

type TrackListProps = {
  userId?: number;
  username?: string;
  artistAvatar?: string;
  //prop to control showing CompactTrackList inside each TrackCard
  showTrackList?: boolean;
  //optional external tracks (likes / reposts pages)
  tracks?: TrackListItem[];
  isLoading?: boolean;
  showEditButton?: boolean;
  // showCommentInput?: boolean;
  currentUserAvatar?: string;
  showHeader?: boolean;
};

export default function TrackList({
  userId,
  username,
  artistAvatar,
  showTrackList = false,

  tracks: externalTracks,
  isLoading: externalLoading = false,
  showEditButton = true,
  // showCommentInput = false,
  currentUserAvatar,
  showHeader = true,
}: TrackListProps) {
  // Only fetch when no external tracks are supplied
  const { tracks: fetchedTracks, isLoading: fetchLoading, isError } = useUserTracks(
    externalTracks === undefined ? { userId, username } : { userId: undefined, username: undefined }
  );

  const isLoading = externalTracks === undefined ? fetchLoading : externalLoading;

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

  if (externalTracks === undefined && isError) {
    return (
      <p className="text-text-muted text-sm">
        Failed to load tracks. Please try again later.
      </p>
    );
  }

  // ── Normalise fetched tracks into TrackListItem shape ─────────
  const items: TrackListItem[] = externalTracks ?? fetchedTracks.map((track) => {
    const artistName =
      typeof track.artist === 'string'
        ? track.artist
        : track.artist.username;

    return {
      trackId: String(track.id),
      user: {
        name: artistName,
        avatar: artistAvatar || track.coverUrl,
      },
      postedText: 'posted a track',
      track: {
        id: track.id,
        artist: artistName,
        title: track.title,
        cover: track.coverUrl,
        duration: '',
        createdAt: track.releaseDate,
      },
      waveform: track.waveformData ?? [],
    };
  });

  if (items.length === 0) {
    return <p className="text-text-muted text-sm">No tracks published yet.</p>;
  }

  return (
    <>
      {items.map((item) => (
        <TrackCard
          key={item.trackId}
          trackId={item.trackId}
          isPrivate={false}
          user={item.user}
          postedText={item.postedText}
          repostedBy={item.repostedBy}
          showTrackList={showTrackList}
          track={item.track}
          waveform={item.waveform}

          showEditButton={showEditButton}
          // showCommentInput={showCommentInput}
          currentUserAvatar={currentUserAvatar}
          showHeader={showHeader}
        />
      ))}
    </>
  );
}