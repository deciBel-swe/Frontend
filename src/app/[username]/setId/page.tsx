'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import { UserMiniProfile } from '@/components/playlist/UserMiniProfile';
import CompactTrackItem from '@/components/compact-tracks/CompactTrackItem';
import { Track } from '@/components/compact-tracks/CompactTrackList'; // Ensure this is the correct path to your type

// 1. Apply the Track type to your mock data
const MOCK_TRACKS: Track[] = [
  {
    id: 1,
    title: "Une vie à t'aimer",
    artist: 'Lorien Testard',
    plays: '333K',
    coverUrl: 'https://i1.sndcdn.com/artworks-000500-large.jpg',
    available: true
  },
  {
    id: 2,
    title: 'For Those Who Come After',
    artist: 'Lorien Testard',
    plays: '41.3K',
    coverUrl: 'https://i1.sndcdn.com/artworks-000501-large.jpg',
    available: true
  },
  {
    id: 3,
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
  
  // Destructure data. You can also destructure isLoading here if needed.
  const { data } = usePublicUser(username);

  // 2. Cast the apiTracks to Track[] to satisfy the compiler
  const apiTracks = (Array.isArray(data?.tracks) ? data.tracks : []) as Track[];

  // 3. Fallback logic: displayTracks is now typed as Track[] automatically
  const displayTracks = apiTracks.length > 0 ? apiTracks : MOCK_TRACKS;

  return (
    <div className="flex gap-8 items-start">
      
      <UserMiniProfile 
        username={username}
        displayName={username}
        avatarUrl={data?.profile?.profilePic}
        followers={data?.profile?.followerCount || 0}
        tracksCount={data?.profile?.trackCount || displayTracks.length}
      />

      <div className="flex-1 min-w-0 my-8 ml-5">
        <Suspense fallback={<TrackListFallback />}>
          <ul className="flex flex-col">
            {/* 4. Removed 'any' and replaced with 'Track' */}
            {displayTracks.map((track: Track, index: number) => (
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