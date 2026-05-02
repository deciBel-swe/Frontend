"use client";

import UserGrid from "@/features/social/UserGrid";
import LoadingSkeleton from "@/features/social/LoadingSkeleton";
import { useFollowing } from '@/hooks/useFollowing';
import { useParams } from "next/navigation";

/**
 * ProfileFollowingPage — /[username]/following
 *
 * Different from /you/following:
 *   /[username]/following  → shows who ANOTHER user follows, with Follow buttons
 *   /you/following         → shows who YOU follow, no Follow buttons, in Library layout
 *
 * Cards are hydrated with useUserCardHook to fill follower counts and avatar data.
 */
export default function ProfileFollowingPage() {
  const { username } = useParams<{ username: string }>();
  const {
    users,
    isLoading,
    hasMore,
    isPaginating,
    sentinelRef,
  } = useFollowing({ username, size: 12, infinite: true });

  return (
    <div className="max-w-[1180px] mx-auto px-6 pt-8 pb-16">

      {/* ── Grid ── */}
      {isLoading ? (
        <LoadingSkeleton variant="user-card" count={12} />
      ) : (
        <UserGrid
          users={users}
          showFollowButton
          emptyTitle={`${username} isn't following anyone yet`}
          hasMore={hasMore}
          isPaginating={isPaginating}
          sentinelRef={sentinelRef}
        />
      )}
    </div>
  );
}
