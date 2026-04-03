'use client';

import TrackList, { type TrackListItem } from '@/components/TrackList';
import { ShareIcon } from '@/components/icons/GenrealIcons';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import { useParams } from 'next/navigation';
import { TrackListFallBack } from '@/components/ui/TrackListFallBack';
import { Suspense } from 'react';

const FIXED_WAVE = [
  0.5,0.7,0.3,0.8,0.6,0.4,0.9,0.5,0.7,0.3,0.8,0.6,0.4,0.9,0.5,
  0.7,0.3,0.8,0.6,0.4,0.9,0.5,0.7,0.3,0.8,0.6,0.4,0.9,0.5,0.7,
  0.3,0.8,0.6,0.4,0.9,0.5,0.7,0.3,0.8,0.6,0.4,0.9,0.5,0.7,0.3,
  0.8,0.6,0.4,0.9,0.5,0.7,0.3,0.8,0.6,0.4,0.9,0.5,0.7,0.3,0.8,
];

export const MOCK_LIKED_TRACKS: TrackListItem[] = [
  {
    trackId: '1',
    user: { name: 'artist 1', avatar: 'https://picsum.photos/seed/billie/200' },
    postedText: 'posted a track',
    track: {
      id: 1,
      artist: 'artist 1',
      title: 'Ocean Eyes',
      cover: 'https://picsum.photos/seed/ocean/400',
      duration: '3:20',
      plays: 73_300_000,
      comments: 27500,
    },
    waveform: FIXED_WAVE,
  },
  {
    trackId: '2',
    user: { name: 'user1', avatar: 'https://picsum.photos/seed/mert/200' },
    postedText: 'posted a track',
    track: {
      id: 2,
      artist: 'user1',
      title: 'Tamally Maak',
      cover: 'https://picsum.photos/seed/amr/400',
      duration: '3:54',
      plays: 3_320_000,
      comments: 235,
    },
    waveform: FIXED_WAVE,
  },
];

interface LikesPageProps {
  tracks?: TrackListItem[];
  isLoading?: boolean;
}

export default function Page({
  tracks = MOCK_LIKED_TRACKS,
  isLoading = false,
}: LikesPageProps) {
  const { username } = useParams<{ username: string }>();
  const { data: profileData } = usePublicUser(username);

  return (
    <div>
      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-secondary m-0">
          Hear the tracks you have liked
        </p>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border-strong rounded text-xs font-semibold text-text-primary bg-surface-default hover:bg-surface-raised transition-colors cursor-pointer">
          <ShareIcon />
          Share
        </button>
      </div>

      {/* ── Track list ── */}
      <Suspense fallback={<TrackListFallBack />}>
        <TrackList
          tracks={tracks}
          isLoading={isLoading}
          // showCommentInput={true}
          currentUserAvatar={profileData?.profile.profilePic}
          showHeader={false}
        />
      </Suspense>
    </div>
  );
}