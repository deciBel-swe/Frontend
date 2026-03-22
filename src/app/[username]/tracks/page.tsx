'use client';
import { Suspense } from 'react';
import { TrackView } from '@/app/[username]/tracks/TrackView';
import TrackList from '@/components/TrackList';
import { useParams } from 'next/navigation';

const TrackListFallback = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="bg-surface-default rounded-lg h-40 animate-pulse" />
    ))}
  </>
);

const TrackViewFallback = () => (
  <div className="bg-surface-default rounded-lg h-20 animate-pulse" />
);

export default function Page() {
  const { username } = useParams<{ username: string }>();
  return (
    <div className="px-8 py-8 max-w-3xl">
      <Suspense fallback={<TrackViewFallback />}>
        <TrackView trackId="1" />
      </Suspense>

      <Suspense fallback={<TrackListFallback />}>
        <TrackList username={username} />
      </Suspense>
    </div>
  );
}
