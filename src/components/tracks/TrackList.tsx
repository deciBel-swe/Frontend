'use client';

import { useMemo } from 'react';

import InfiniteScrollPagination from '@/components/pagination/InfiniteScrollPagination';
import TrackCard from '@/components/tracks/track-card/TrackCard';
import type {
  PlaybackAccess,
  PlayerTrack,
} from '@/features/player/contracts/playerContracts';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { useUserTracks } from '@/hooks/useUserTracks';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { formatDuration } from '@/utils/formatDuration';

const toPlaybackAccess = (
  access: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined
): PlaybackAccess => {
  if (access === 'BLOCKED' || access === 'PREVIEW') {
    return 'BLOCKED';
  }
  return 'PLAYABLE';
};

export type TrackListItem = {
  trackId: string;
  user: { username: string; displayName?: string; avatar: string };
  postedText?: string;
  repostedBy?: { username: string; displayName?: string; avatar?: string };
  track: {
    id: number;
    artist: {
      username: string;
      displayName?: string;
      avatar: string;
    };
    title: string;
    cover: string;
    duration: string;
    plays?: number;
    trackSlug?: string;
    comments?: number;
    createdAt?: string;
    genre?: string;
    durationSeconds?: number;
    isLiked?: boolean;
    isReposted?: boolean;
    likeCount?: number;
    repostCount?: number;
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
  isPaginating?: boolean;
  hasMore?: boolean;
  sentinelRef?: (node: HTMLDivElement | null) => void;
  emptyStateText?: string;
};

export default function TrackList({
  userId,
  username,
  showTrackList = false,

  tracks: externalTracks,
  isLoading: externalLoading = false,
  showEditButton = false,
  // showCommentInput = false,
  currentUserAvatar,
  showHeader = true,
  isPaginating = false,
  hasMore = false,
  sentinelRef,
  emptyStateText = 'No tracks published yet.',
}: TrackListProps) {
  const ownerContext = useProfileOwnerContext();
  const shouldFetchInternally = externalTracks === undefined;

  // Only fetch when no external tracks are supplied
  const {
    tracks: fetchedTracks,
    isLoading: fetchLoading,
    isError,
    hasMore: fetchedHasMore,
    isPaginating: fetchedIsPaginating,
    sentinelRef: fetchedSentinelRef,
  } = useUserTracks(
    shouldFetchInternally
      ? { userId, username, size: 24, infinite: true }
      : { userId: undefined, username: undefined }
  );

  const resolvedShowEditButton =
    ownerContext !== undefined
      ? ownerContext.isOwner
      : showEditButton;

  const isLoading = shouldFetchInternally ? fetchLoading : externalLoading;
  const resolvedHasMore = shouldFetchInternally ? fetchedHasMore : hasMore;
  const resolvedIsPaginating = shouldFetchInternally
    ? fetchedIsPaginating
    : isPaginating;
  const resolvedSentinelRef = shouldFetchInternally
    ? fetchedSentinelRef
    : sentinelRef;

  // Normalize fetched service DTOs into TrackCard + playback mapping shape.
  const baseItems: TrackListItem[] =
    externalTracks ??
    fetchedTracks.map((track) => {
      const durationSeconds =
        typeof track.durationSeconds === 'number' && track.durationSeconds > 0
          ? track.durationSeconds
          : undefined;

      const artist = {
        username: track.artist.username,
        displayName: track.artist.displayName,
        avatar: track.artist.avatarUrl ?? '/images/default_avatar.png',
      };

      return {
        trackId: String(track.id),
        user: {
          username: artist.username,
          displayName: artist.displayName,
          avatar: artist.avatar,
        },
        postedText: 'posted a track',
        track: {
          id: track.id,
          trackSlug: track.trackSlug,
          artist,
          title: track.title,
          cover: track.coverUrl,
          duration: durationSeconds ? formatDuration(durationSeconds) : '',
          createdAt: track.releaseDate,
          genre: track.genre,
          durationSeconds,
          isLiked: track.isLiked,
          isReposted: track.isReposted,
          likeCount: track.likeCount,
          repostCount: track.repostCount,
        },
        trackUrl: track.trackUrl,
        access: toPlaybackAccess(track.access),
        waveform: track.waveformData ?? [],
      };
    });

  const items: TrackListItem[] = baseItems;
  
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

  if (isLoading && items.length === 0) {
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

  if (shouldFetchInternally && isError) {
    return (
      <p className="text-text-muted text-sm">
        Failed to load tracks. Please try again later.
      </p>
    );
  }

  if (items.length === 0) {
    return <p className="text-text-muted text-sm">{emptyStateText}</p>;
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
      <InfiniteScrollPagination
        hasMore={resolvedHasMore}
        isPaginating={resolvedIsPaginating}
        sentinelRef={resolvedSentinelRef}
        loader={
          <div className="space-y-3 py-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`track-list-append-${index}`}
                className="bg-surface-default rounded-lg h-40 animate-pulse"
              />
            ))}
          </div>
        }
      />
    </>
  );
}
