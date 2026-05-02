'use client';

import { useParams } from 'next/navigation';

import TrackEngagementPage from '@/features/social/components/TrackEngagementPage';

export default function Page() {
  const { trackId } = useParams<{ username: string; trackId: string }>();

  return (
    <TrackEngagementPage
      trackId={trackId}
      type="likes"
    />
  );
}
