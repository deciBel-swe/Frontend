'use client';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import TrackList from '@/components/tracks/TrackList';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
const TrackListFallback = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        className="bg-surface-default rounded-lg h-40 animate-pulse"
      />
    ))}
  </>
);
export default function Page() {
  const { username } = useParams<{ username: string }>();
  // Fetch the profile data to grab the real avatar
  const { data: profileData } = usePublicUser(username);
  return (
    <div className="w-full min-w-0">
      <Suspense fallback={<TrackListFallback />}>
        <TrackList
          username={username}
          artistAvatar={profileData?.profile.profilePic}
          showTrackList= {true}
        />
      </Suspense>
    </div>
  );
}
