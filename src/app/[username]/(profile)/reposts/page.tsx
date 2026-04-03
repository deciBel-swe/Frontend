'use client';

import TrackList, { type TrackListItem } from '@/components/TrackList';
import { TrackListFallBack } from '@/components/ui/TrackListFallBack';
import { Suspense } from 'react';

const mockWave = (length = 60): number[] =>
  Array.from({ length }, () => Math.random() * 0.8 + 0.1);

const MOCK_REPOSTED_TRACKS: TrackListItem[] = [
  {
    trackId: '1',
    user: { name: 'user1', avatar: 'https://picsum.photos/seed/mert/200' },
    repostedBy: 'user1',
    track: {
      id: 1,
      artist: 'Amr Diab',
      title: 'Tamally Maak',
      cover: 'https://picsum.photos/seed/amr/400',
      duration: '3:54',
      plays: 32,
      comments: 235,
    },
    waveform: mockWave(),
  },
  {
    trackId: '2',
    user: { name: 'user1', avatar: 'https://picsum.photos/seed/billie/200' },
    repostedBy: 'user1',
    track: {
      id: 2,
      artist: 'artist 1',
      title: 'Ocean Eyes',
      cover: 'https://picsum.photos/seed/ocean/400',
      duration: '3:20',
      plays: 500,
      comments: 27500,
    },
    waveform: mockWave(),
  },
];

interface RepostsPageProps {
  tracks?: TrackListItem[];
  isLoading?: boolean;
}

export default function Page({
  tracks = MOCK_REPOSTED_TRACKS,
  isLoading = false,
}: RepostsPageProps) {
  return (
    <div>
      <Suspense fallback={<TrackListFallBack />}>
        <TrackList
          tracks={tracks}
          isLoading={isLoading}
          showHeader={false}
        />
      </Suspense>
    </div>
  );
}