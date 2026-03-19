'use client';

import { TrackView } from '@/app/[username]/tracks/TrackView';
import { QueryProvider } from '@/providers/QueryProvider';

export default function Page() {
  return (
    <QueryProvider>
      <div className="px-8 py-8 max-w-3xl">
        <TrackView trackId="1"/>
      </div>
    </QueryProvider>
  );
}