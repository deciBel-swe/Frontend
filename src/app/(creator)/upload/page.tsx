'use client';

import { useState } from 'react';
import { TrackPrivacy } from '@/app/(creator)/upload/TrackPrivacy';
import type { TrackPrivacyValue } from '@/types/tracks';
import { QueryProvider } from '@/providers/QueryProvider';


export default function Page() {
  const [privacy, setPrivacy] = useState<TrackPrivacyValue>('public');

  return (
    <QueryProvider>
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

      </div>
    </QueryProvider>
  );
}