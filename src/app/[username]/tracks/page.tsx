'use client';

import { TrackView } from '@/app/[username]/tracks/TrackView';
import TrackList from '@/components/TrackList';
import { useParams } from 'next/navigation';

export default function Page() {
  const { username } = useParams<{ username: string }>();
  return (
    <div className="px-8 py-8 max-w-3xl">
      <TrackView trackId="1" />
      <TrackList username={username} />
    </div>
  );
}
