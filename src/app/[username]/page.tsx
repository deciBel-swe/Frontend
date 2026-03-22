'use client';

import TrackList from '@/components/TrackList';
import { useParams } from 'next/navigation';

export default function Page() {
  const { username } = useParams<{ username: string }>();
  return (
    <div className="px-8 py-8 max-w-3xl">
      <TrackList username={username} />
    </div>
  );
}
