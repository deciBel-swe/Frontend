'use client';

import TrackList from '@/components/TrackList';
import { TrackListFallBack } from '@/components/ui/TrackListFallBack';
import { useUserRepostPage } from '@/hooks/useUserRepostPage';

export default function Page() {
  const { tracks, isLoading, isError } = useUserRepostPage();

  if (isLoading) {
    return <TrackListFallBack />;
  }

  if (isError) {
    return (
      <p className="text-text-muted text-sm">
        Failed to load reposted tracks. Please try again later.
      </p>
    );
  }

  return (
    <div>
      <TrackList
        tracks={tracks}
        isLoading={isLoading}
        showHeader={false}
      />
    </div>
  );
}