'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import { UserMiniProfile } from '@/components/playlist/UserMiniProfile';
import CompactTrackItem from '@/components/CompactTrackItem';

// 1. MOCK DATA (Put this outside the component)
const MOCK_TRACKS = [
  {
    id: '1',
    title: 'Une vie à t\'aimer',
    artist: 'Lorien Testard',
    plays: '333K',
    coverUrl: 'https://i1.sndcdn.com/artworks-000500-large.jpg',
    available: true
  },
  {
    id: '2',
    title: 'For Those Who Come After',
    artist: 'Lorien Testard',
    plays: '41.3K',
    coverUrl: 'https://i1.sndcdn.com/artworks-000501-large.jpg',
    available: true
  },
  {
    id: '3',
    title: 'Alicia',
    artist: 'Victor Borba',
    plays: '224K',
    coverUrl: 'https://i1.sndcdn.com/artworks-000502-large.jpg',
    available: true
  }
];

const TrackListFallback = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="bg-surface-default rounded h-10 animate-pulse w-full" />
    ))}
  </div>
);

export default function Page() {
  const { username } = useParams<{ username: string }>();
  
  // 1. Destructure data and isLoading
  const { data, isLoading } = usePublicUser(username);

  // 2. Safely extract tracks. 
  // We check if data exists, if tracks exists, and if it's an array.
  const apiTracks = Array.isArray(data?.tracks) ? data.tracks : [];

  // 3. Fallback logic: If API is empty or loading, use Mocks
  const displayTracks = apiTracks.length > 0 ? apiTracks : MOCK_TRACKS;

  return (
    <div className="flex gap-8 items-start">
      
      <UserMiniProfile 
        username={username}
        // displayName={data?.profile?.displayName || username} 
        displayName={username}
        avatarUrl={data?.profile?.profilePic}
        followers={data?.profile?.followerCount || 0}
        tracksCount={data?.profile?.trackCount || displayTracks.length}
      />

      <div className="flex-1 min-w-0 my-8 ml-5">
        <Suspense fallback={<TrackListFallback />}>
          {/* 4. We use displayTracks which is guaranteed to be an Array now */}
          <ul className="flex flex-col">
            {displayTracks.map((track: any, index: number) => (
              <CompactTrackItem 
                key={track.id || index} 
                track={track} 
                index={index} 
              />
            ))}
          </ul>
        </Suspense>
      </div>
    </div>
  );
}