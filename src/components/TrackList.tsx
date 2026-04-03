'use client';

import { useMemo } from 'react';

import TrackCard from '@/components/TrackCard';
import type {
  PlaybackAccess,
  PlayerTrack,
} from '@/features/player/contracts/playerContracts';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { useUserTracks } from '@/hooks/useUserTracks';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { formatDuration } from '@/utils/formatDuration';

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
  trackUrl?: string;
  access?: PlaybackAccess;
  playback?: PlayerTrack;
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
  showEditButton = false,
  // showCommentInput = false,
  currentUserAvatar,
  showHeader = true,
}: TrackListProps) {
  const ownerContext = useProfileOwnerContext();

  // Only fetch when no external tracks are supplied
  const { tracks: fetchedTracks, isLoading: fetchLoading, isError } = useUserTracks(
    externalTracks === undefined ? { userId, username } : { userId: undefined, username: undefined }
  );

  const resolvedShowEditButton =
    ownerContext !== undefined
      ? ownerContext.isOwner
      : showEditButton;

  const isLoading = externalTracks === undefined ? fetchLoading : externalLoading;

  // Normalize fetched service DTOs into TrackCard + playback mapping shape.
  const items: TrackListItem[] = externalTracks ?? fetchedTracks.map((track) => {
    const artistName =
      typeof track.artist === 'string'
        ? track.artist
        : track.artist.username;
    const durationSeconds =
      typeof track.durationSeconds === 'number' && track.durationSeconds > 0
        ? track.durationSeconds
        : undefined;

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
        duration: durationSeconds ? formatDuration(durationSeconds) : '',
        createdAt: track.releaseDate,
        durationSeconds,
      },
      trackUrl: track.trackUrl,
      access: 'PLAYABLE',
      waveform: track.waveformData ?? [],
    };
  });
  
  const queueTracks = useMemo(
    // Build canonical queue payload once per list snapshot.
    () =>
      items
        .map((item) => {
          if (item.playback) {
            return item.playback;
          }

          if (!item.trackUrl) {
            return null;
          }

          return playerTrackMappers.fromAdapterInput({
            id: item.track.id,
            title: item.track.title,
            trackUrl: item.trackUrl,
            artist: item.track.artist,
            coverUrl: item.track.cover,
            waveformData: item.waveform,
            durationSeconds: item.track.durationSeconds,
          }, { access: item.access ?? 'PLAYABLE' });
        })
        .filter((item): item is PlayerTrack => item !== null),
    [items]
  );

    if (items.length === 0) {
      return <p className="text-text-muted text-sm">No tracks published yet.</p>;
    }

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
  return (
    <>
      {items.map((item) => {
        // Resolve per-item canonical playback track for card integration.
        const playback = item.playback ?? (
          item.trackUrl
            ? playerTrackMappers.fromAdapterInput(
                {
                  id: item.track.id,
                  title: item.track.title,
                  trackUrl: item.trackUrl,
                  artist: item.track.artist,
                  coverUrl: item.track.cover,
                  waveformData: item.waveform,
                  durationSeconds: item.track.durationSeconds,
                },
                { access: item.access ?? 'PLAYABLE' }
              )
            : undefined
        );

        return (
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
          playback={playback}
          queueTracks={queueTracks}
          queueSource="profile-tracks"

          showEditButton={resolvedShowEditButton}
          // showCommentInput={showCommentInput}
          currentUserAvatar={currentUserAvatar}
          showHeader={showHeader}
        />
        );
      })}
    </>
  );
}