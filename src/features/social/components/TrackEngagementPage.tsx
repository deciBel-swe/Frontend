'use client';

import UserGrid from '@/features/social/UserGrid';
import LoadingSkeleton from '@/features/social/LoadingSkeleton';
import { useTrackEngagementPage } from '@/hooks/useTrackEngagementPage';

type TrackEngagementPageProps = {
  trackId: string;
  type: 'likes' | 'reposts';
};

export default function TrackEngagementPage({
  trackId,
  type,
}: TrackEngagementPageProps) {
  const { users, isLoading, isError } = useTrackEngagementPage({
    trackId,
    type,
  });

  const title = type === 'likes' ? 'Users who liked this track' : 'Users who reposted this track';
  const emptyTitle = type === 'likes'
    ? 'No likes yet for this track.'
    : 'No reposts yet for this track.';

  if (isError) {
    return (
      <div className="max-w-295 mx-auto px-6 pt-6 pb-16 text-text-muted text-sm">
        Failed to load this engagement page. Please try again later.
      </div>
    );
  }

  return (
    <div className="max-w-295 mx-auto px-6 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 text-text-primary">{title}</h1>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="user-card" count={12} />
      ) : (
        <UserGrid
          users={users}
          showFollowButton
          emptyTitle={emptyTitle}
        />
      )}
    </div>
  );
}
