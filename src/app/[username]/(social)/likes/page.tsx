'use client';

import TrackList from '@/components/TrackList';
import { ShareIcon } from '@/components/icons/GenrealIcons';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import { useLikedTracks } from '@/hooks/useLikedTracks';
import { useParams } from 'next/navigation';
import { TrackListFallBack } from '@/components/ui/TrackListFallBack';
import { Suspense } from 'react';

export default function Page() {
  const { username } = useParams<{ username: string }>();
  const { data: profileData } = usePublicUser(username);
  const { tracks, isLoading, isOwner } = useLikedTracks(username);

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