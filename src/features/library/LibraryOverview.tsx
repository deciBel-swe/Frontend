'use client';

import { useMemo } from 'react';

import InfiniteScrollPagination from '@/components/pagination/InfiniteScrollPagination';
import MinimalTrackCard from '@/components/tracks/MinimalTrackCard';
import PlaylistCard from '@/components/playlist/MinimalPlaylistCard';
import type { PlayerTrack } from '@/features/player/contracts/playerContracts';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import UserCard from '@/features/social/components/UserCard';
import LibrarySection from './LibrarySection';
import { useAuth } from '@/features/auth';
import { useFollowing } from '@/hooks/useFollowing';
import { useLikedTracks } from '@/hooks/useLikedTracks';
import { useListeningHistoryTracks } from '@/hooks/useListeningHistoryTracks';

export function SquareSkeleton() {
  return (
    <div className="shrink-0 rounded-lg bg-surface-raised animate-pulse m-2 w-26 h-32 md:w-32 md:h-38 lg:w-40 lg:h-46" />
  );
}

export default function LibraryOverview() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const {
    tracks: historyTracks,
    isLoading: isHistoryLoading,
    hasMore: historyHasMore,
    isPaginating: isHistoryPaginating,
    sentinelRef: historySentinelRef,
  } = useListeningHistoryTracks({ size: 12, infinite: true });

  const {
    tracks: likedTracks,
    isLoading: isLikesLoading,
    hasMore: likesHasMore,
    isPaginating: isLikesPaginating,
    sentinelRef: likesSentinelRef,
  } = useLikedTracks(
    user?.username ?? '',
    { forCurrentUser: true, size: 12, infinite: true }
  );

  const {
    users: followingUsers,
    isLoading: isFollowingLoading,
    hasMore: followingHasMore,
    isPaginating: isFollowingPaginating,
    sentinelRef: followingSentinelRef,
  } = useFollowing({
    username: user?.username ?? '',
    size: 12,
    infinite: true,
  });

  const likesQueueTracks = useMemo(
    () =>
      likedTracks
        .map((item) => {
          if (item.playback) {
            return item.playback;
          }

          if (!item.trackUrl) {
            return null;
          }

          return playerTrackMappers.fromAdapterInput(
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
          );
        })
        .filter((item): item is PlayerTrack => item !== null),
    [likedTracks]
  );

  return (
    <div className="px-8 py-8">
      <LibrarySection
        title="Recently played"
        ctaLabel="View all"
        ctaHref="/you/history"
        useHorizontalScroll={false}
      >
        <div className="flex flex-wrap gap-4">
          {isAuthLoading || isHistoryLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <SquareSkeleton key={`history-skeleton-${index}`} />
              ))
            : historyTracks.map((item) => (
                <PlaylistCard
                  key={item.trackId}
                  title={item.track.title}
                  coverUrl={item.track.cover}
                  username={item.user.username}
                />
              ))}
        </div>
        <InfiniteScrollPagination
          hasMore={historyHasMore}
          isPaginating={isHistoryPaginating}
          sentinelRef={historySentinelRef}
          loader={
            <div className="flex flex-wrap gap-4 pt-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <SquareSkeleton key={`history-append-${index}`} />
              ))}
            </div>
          }
        />
      </LibrarySection>

      <LibrarySection
        title="Likes"
        ctaLabel="View all"
        ctaHref="/you/likes"
        useHorizontalScroll={false}
      >
        <div className="flex flex-wrap gap-4">
          {isAuthLoading || isLikesLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <SquareSkeleton key={`likes-skeleton-${index}`} />
              ))
            : likedTracks.map((item) => (
                <MinimalTrackCard
                  key={item.trackId}
                  item={item}
                  queueTracks={likesQueueTracks}
                  queueSource="likes"
                />
              ))}
        </div>
        <InfiniteScrollPagination
          hasMore={likesHasMore}
          isPaginating={isLikesPaginating}
          sentinelRef={likesSentinelRef}
          loader={
            <div className="flex flex-wrap gap-4 pt-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <SquareSkeleton key={`likes-append-${index}`} />
              ))}
            </div>
          }
        />
      </LibrarySection>

      <LibrarySection
        title="Following"
        ctaLabel="View all"
        ctaHref="/you/following"
        useHorizontalScroll={false}
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isAuthLoading || isFollowingLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <SquareSkeleton key={`following-skeleton-${index}`} />
              ))
            : followingUsers.map((userCard) => (
                <UserCard key={userCard.id} user={userCard} />
              ))}
        </div>
        <InfiniteScrollPagination
          hasMore={followingHasMore}
          isPaginating={isFollowingPaginating}
          sentinelRef={followingSentinelRef}
          loader={
            <div className="grid gap-6 pt-2 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <SquareSkeleton key={`following-append-${index}`} />
              ))}
            </div>
          }
        />
      </LibrarySection>
    </div>
  );
}
