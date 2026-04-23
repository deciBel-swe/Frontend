"use client";

import UserGrid from "@/features/social/UserGrid";
import LoadingSkeleton from "@/features/social/LoadingSkeleton";
import { useSuggestedUsers } from '@/hooks/useSuggestedUsers';

/**
 * PeoplePage — /people
 *
 * "Who to follow" discovery page.
 * Suggested profiles based on the current user's follows and listening history.
 *
 * Data shape from API:
 *   GET /users/suggested → { content: User[], pageNumber, pageSize, totalElements }
 *
 * Reuses the same UserGrid + UserCard as /[username]/followers
 * and /[username]/following — no new components needed.
 */
export default function Page() {
  const {
    users,
    isLoading,
    hasMore,
    isPaginating,
    sentinelRef,
  } = useSuggestedUsers({ size: 18, infinite: false });

  return (
    <div className="max-w-295 mx-auto px-6 pt-8 pb-16">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 text-text-primary">
          Who to follow
        </h1>
        <p className="text-sm text-text-muted">
          Suggested profiles based on your follows and tracks you&apos;ve liked or played.
        </p>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <LoadingSkeleton variant="user-card" count={12} />
      ) : (
        <UserGrid
          users={users}
          showFollowButton
          emptyTitle="No suggestions right now. Follow some artists to get started."
          hasMore={hasMore}
          isPaginating={isPaginating}
          sentinelRef={sentinelRef}
        />
      )}
    </div>
  );
}
