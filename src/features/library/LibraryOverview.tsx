'use client';

import { useMemo } from 'react';

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

function SquareSkeleton() {
  return (
    <div className="shrink-0 rounded-lg bg-surface-raised animate-pulse m-2 w-26 h-26 md:w-32 md:h-32 lg:w-40 lg:h-40" />
  );
}

export default function LibraryOverview() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const { tracks: historyTracks, isLoading: isHistoryLoading } =
    useListeningHistoryTracks({ page: 0, size: 12 });

  const { tracks: likedTracks, isLoading: isLikesLoading } = useLikedTracks(
    user?.username ?? '',
    { forCurrentUser: true }
  );

  const { users: followingUsers, isLoading: isFollowingLoading } = useFollowing({
    username: user?.username ?? '',
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
      <LibrarySection title="Recently played" ctaLabel="View all" ctaHref="/you/history">
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
      </LibrarySection>

      <LibrarySection title="Likes" ctaLabel="View all" ctaHref="/you/likes">
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
      </LibrarySection>

      <LibrarySection title="Following" ctaLabel="View all" ctaHref="/you/following">
        {isAuthLoading || isFollowingLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <SquareSkeleton key={`following-skeleton-${index}`} />
            ))
          : followingUsers.map((userCard) => (
              <UserCard key={userCard.id} user={userCard} />
            ))}
      </LibrarySection>
    </div>
  );
}
