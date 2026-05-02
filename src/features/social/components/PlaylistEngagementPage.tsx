'use client';

import LoadingSkeleton from '@/features/social/LoadingSkeleton';
import UserGrid from '@/features/social/UserGrid';
import { usePlaylistEngagementPage } from '@/hooks/usePlaylistEngagementPage';

type PlaylistEngagementPageProps = {
  playlistId: string;
  type: 'likes' | 'reposts';
};

const PAGE_SIZE = 10;

export default function PlaylistEngagementPage({
  playlistId,
  type,
}: PlaylistEngagementPageProps) {
  const {
    users,
    isLoading,
    isError,
    totalElements,
    hasMore,
    isPaginating,
    sentinelRef,
  } =
    usePlaylistEngagementPage({
      playlistId,
      type,
      size: PAGE_SIZE,
      infinite: true,
    });

  const title =
    type === 'likes'
      ? 'Users who liked this playlist'
      : 'Users who reposted this playlist';
  const emptyTitle =
    type === 'likes'
      ? 'No likes yet for this playlist.'
      : 'No reposts yet for this playlist.';

  if (isError) {
    return (
      <div className="mx-auto max-w-295 px-6 pb-16 pt-6 text-sm text-text-muted">
        Failed to load this engagement page. Please try again later.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-295 px-6 pb-16">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-text-primary">{title}</h1>
        <p className="text-sm text-text-muted">
          {totalElements.toLocaleString()} users
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="user-card" count={12} />
      ) : (
        <UserGrid
          users={users}
          showFollowButton
          emptyTitle={emptyTitle}
          hasMore={hasMore}
          isPaginating={isPaginating}
          sentinelRef={sentinelRef}
        />
      )}
    </div>
  );
}
