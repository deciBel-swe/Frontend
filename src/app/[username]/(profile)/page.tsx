'use client';

import TrackList from '@/components/TrackList';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
const TrackListFallback = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="bg-surface-default rounded-lg h-40 animate-pulse" />
    ))}
  </>
);
export default function Page() {
  const { username } = useParams<{ username: string }>();
  return (
    <div className="w-full flex justify-center">
      {/* PAGE CONTAINER */}
      <div className="w-full max-w-[1200px] flex gap-8 py-6">
        {/* ================= MAIN FEED ================= */}
        <main className="flex-1 flex flex-col">      
        <Suspense fallback={<TrackListFallback />}>
        <TrackList username={username} />
      </Suspense></main>

      </div>
    </div>
  );
}
