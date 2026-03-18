// page.tsx — minimal
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrackView } from '@/app/[username]/tracks/TrackView';

const client = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={client}>
      <div className="px-8 py-8 max-w-3xl">
        <TrackView trackId="1" />
      </div>
    </QueryClientProvider>
  );
}