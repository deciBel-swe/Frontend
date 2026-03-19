'use client';

import { useEffect, useState } from 'react';
import { useTrackVisibility } from '@/hooks/useTrackVisibility';
import { TrackActionBar } from '@/app/[username]/tracks/TrackActionBar';
import { TrackPrivacy } from '@/app/(creator)/upload/TrackPrivacy';
import type { TrackPrivacyValue } from '@/types/tracks';

interface TrackViewProps {
  trackId: string;
}

export function TrackView({ trackId }: TrackViewProps) {
   const numericId = Number(trackId);
  const { visibility, updateVisibility } = useTrackVisibility(numericId);
  const [privacy, setPrivacy] = useState<TrackPrivacyValue>('public');

  useEffect(() => {
    if (visibility) {
      setPrivacy(visibility.isPrivate ? 'private' : 'public');
    }
  }, [visibility]);

  const handlePrivacyChange = (next: TrackPrivacyValue) => {
    setPrivacy(next);
    updateVisibility({ isPrivate: next === 'private' });
  };

  return (
   <div className="flex flex-col gap-3">
        {/* TODO: remove TrackPrivacy after testing */}
        <TrackPrivacy
        value={privacy}
        onChange={handlePrivacyChange}
        trackId={trackId}
      />

      <TrackActionBar
        trackId={trackId}
        isPrivate={privacy === 'private'}
      />
    </div>
  );
}