'use client';

import TrackCard from '@/components/TrackCard';
import { ShareIcon } from '@/components/icons/GenrealIcons';
import { TrackCardSkeleton } from '@/components/ui/TrackCardSkeleton';

// ── Mock waveform helper ──────────────────────────────────────
const mockWave = (length = 60) =>
  Array.from({ length }, () => Math.random() * 0.8 + 0.1);

// ── Mock data matching TrackCard's expected shape ─────────────
const MOCK_LIKED_TRACKS = [
  {
    trackId: '1',
    user: { name: 'BillieEilish', avatar: 'https://picsum.photos/seed/billie/200' },
    postedText: 'posted a track',
    timeAgoText: '10 years ago',
    track: {
      id: 1,
      artist: 'Billie Eilish',
      title: 'Ocean Eyes',
      cover: 'https://picsum.photos/seed/ocean/400',
      duration: '3:20',
      plays: 73_300_000,
      comments: 27500,
    },
    waveform: mockWave(),
  },
  {
    trackId: '2',
    user: { name: 'user1', avatar: 'https://picsum.photos/seed/mert/200' },
    postedText: 'posted a track',
    timeAgoText: '4 days ago',
    track: {
      id: 2,
      artist: 'user1',
      title: 'Tamally Maak',
      cover: 'https://picsum.photos/seed/amr/400',
      duration: '3:54',
      plays: 3_320_000,
      comments: 235,
    },
    waveform: mockWave(),
  },
];

interface LikesPageProps {
  tracks?: typeof MOCK_LIKED_TRACKS;
  isLoading?: boolean;
}

export default function Page({
  tracks = MOCK_LIKED_TRACKS,
  isLoading = false,
}: LikesPageProps) {
  return (
    <div>
      {/* ── Section row ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-secondary m-0">
          Hear the tracks you have liked
        </p>
        <button
          className="
            flex items-center gap-1.5
            px-3 py-1.5
            border border-border-strong
            rounded
            text-xs font-semibold text-text-primary
            bg-surface-default
            hover:bg-surface-raised
            transition-colors
            cursor-pointer
          "
        >
          <ShareIcon />
          Share
        </button>
      </div>

      {/* ── Track list ── */}
      {isLoading ? (
        <TrackCardSkeleton />
      ) : tracks.length === 0 ? (
        <p className="text-sm text-text-muted mt-8 text-center">
          No liked tracks yet.
        </p>
      ) : (
        <div className="flex flex-col">
          {tracks.map((t) => (
            <TrackCard
              key={t.trackId}
              trackId={t.trackId}
              user={t.user}
              postedText={t.postedText}
              timeAgoText={t.timeAgoText}
              track={t.track}
              waveform={t.waveform}
              showEditButton={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}