'use client';

import { useState } from 'react';
import LoadingSkeleton from '@/features/social/LoadingSkeleton';
import UserGrid from '@/features/social/UserGrid';
import { usePlaylistEngagementPage } from '@/hooks/usePlaylistEngagementPage';

type PlaylistEngagementPageProps = {
  playlistId: string;
  type: 'likes' | 'reposts';
};

const PAGE_SIZE = 24;

export default function PlaylistEngagementPage({
  playlistId,
  type,
}: PlaylistEngagementPageProps) {
  const [page, setPage] = useState(0);
  const { users, isLoading, isError, totalElements, totalPages } =
    usePlaylistEngagementPage({
      playlistId,
      type,
      page,
      size: PAGE_SIZE,
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
        <UserGrid users={users} showFollowButton emptyTitle={emptyTitle} />
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded border border-border-default px-3 py-1.5 text-sm text-text-primary disabled:opacity-40"
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            disabled={page <= 0 || isLoading}
          >
            Previous
          </button>
          <span className="text-sm text-text-muted">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            className="rounded border border-border-default px-3 py-1.5 text-sm text-text-primary disabled:opacity-40"
            onClick={() =>
              setPage((value) => Math.min(totalPages - 1, value + 1))
            }
            disabled={page >= totalPages - 1 || isLoading}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
