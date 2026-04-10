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
  const { tracks, isLoading } = useLikedTracks(username);

  return (
    <div>

      {/* ── Track list ── */}
      <Suspense fallback={<TrackListFallBack />}>
        <TrackList
          tracks={tracks}
          isLoading={isLoading}
          currentUserAvatar={profileData?.profile.profilePic}
          showHeader={false}
        />
      </Suspense>
    </div>
  );
}