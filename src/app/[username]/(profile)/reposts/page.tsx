'use client';

import TrackCard from '@/components/TrackCard';
import { TrackCardSkeleton } from '@/components/ui/TrackCardSkeleton';

// ── Mock waveform helper ──────────────────────────────────────
const mockWave = (length = 60) =>
  Array.from({ length }, () => Math.random() * 0.8 + 0.1);

// ── Mock data ─────────────────────────────────────────────────
const MOCK_REPOSTED_TRACKS = [
  {
    trackId: '1',
    user: { name: 'user1', avatar: 'https://picsum.photos/seed/mert/200' },
    repostedBy: 'user1',
    timeAgoText: '4 days ago',
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
    timeAgoText: '2 weeks ago',
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
  tracks?: typeof MOCK_REPOSTED_TRACKS;
  isLoading?: boolean;
}

export default function Page({
  tracks = MOCK_REPOSTED_TRACKS,
  isLoading = false,
}: RepostsPageProps) {
  return (
    <div>
      {/* ── Track list ── */}
      {isLoading ? (
        <TrackCardSkeleton />
      ) : tracks.length === 0 ? (
        <p className="text-sm text-text-muted mt-8 text-center">
          No reposts yet.
        </p>
      ) : (
        <div className="flex flex-col">
          {tracks.map((t) => (
            <TrackCard
              key={t.trackId}
              trackId={t.trackId}
              user={t.user}
              repostedBy={t.repostedBy}
              timeAgoText={t.timeAgoText}
              track={t.track}
              waveform={t.waveform}
              showEditButton={false}
              showHeader={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
