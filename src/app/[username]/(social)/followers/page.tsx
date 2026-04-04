"use client";

import UserGrid from "@/components/ui/social/UserGrid";
import LoadingSkeleton from "@/components/ui/social/LoadingSkeleton";
import { useFollowers } from '@/hooks/useFollowers';
import { useParams } from "next/navigation";

/**
 * FollowersPage — /[username]/followers
 *
 * Data shape from API:
 *   GET /users/{userId}/followers
 *   → { content: Follower[], pageNumber, pageSize, totalElements, totalPages }
 *
 * UserCard rows are hydrated with useUserCardHook, so list payloads can stay lightweight.
 */
export default function FollowersPage() {
  const { username } = useParams<{ username: string }>();
  const { users, isLoading } = useFollowers({ username });

  return (
    <div className="max-w-[1180px] mx-auto px-6 pt-8 pb-16">

      {/* ── Grid ── */}
      {isLoading ? (
        <LoadingSkeleton variant="user-card" count={12} />
      ) : (
        <UserGrid
          users={users}
          showFollowButton
          emptyTitle={`${username} has no followers yet`}
        />
      )}
    </div>
  );
}