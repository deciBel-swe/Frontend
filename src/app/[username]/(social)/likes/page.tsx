'use client';

import TrackList from '@/components/tracks/TrackList';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import { useLikedTracks } from '@/hooks/useLikedTracks';
import { useParams } from 'next/navigation';
import { TrackListFallBack } from '@/features/tracks/components/TrackListFallBack';
import { Suspense } from 'react';

export default function Page() {
  const { username } = useParams<{ username: string }>();
  const { data: profileData } = usePublicUser(username);
  const {
    tracks,
    isLoading,
    hasMore,
    isPaginating,
    sentinelRef,
  } = useLikedTracks(username, {
    size: 24,
    infinite: true,
  });

  return (
    <div>

      {/* ── Track list ── */}
      <Suspense fallback={<TrackListFallBack />}>
        <TrackList
          tracks={tracks}
          isLoading={isLoading}
          currentUserAvatar={profileData?.profile.profilePic}
          showHeader={false}
          hasMore={hasMore}
          isPaginating={isPaginating}
          sentinelRef={sentinelRef}
        />
      </Suspense>
    </div>
  );
}
