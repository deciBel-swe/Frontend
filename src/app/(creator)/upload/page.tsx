'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrackPrivacy } from '@/app/(creator)/upload/TrackPrivacy';
import type { TrackPrivacyValue } from '@/types';

const client = new QueryClient();

export default function Page() {
  const [privacy, setPrivacy] = useState<TrackPrivacyValue>('public');

  return (
    <QueryClientProvider client={client}>
      <div className="p-8 max-w-xl">
        <h1 className="text-lg font-bold mb-6">Upload Track (dev test)</h1>

        <TrackPrivacy
          value={privacy}
          onChange={(val) => {
            console.log('privacy changed to:', val);
            setPrivacy(val);
          }}
        />

        <p className="mt-6 text-xs text-text-muted">
          Current value: <strong>{privacy}</strong>
        </p>

        {/* secret link test: */}
        <hr className="my-8 border-border-default" />

        <h1 className="text-lg font-bold mb-6">Edit mode (with trackId)</h1>
        <TrackPrivacy
          value={privacy}
          onChange={setPrivacy}
          trackId="1"
        />

      </div>
    </QueryClientProvider>
  );
}