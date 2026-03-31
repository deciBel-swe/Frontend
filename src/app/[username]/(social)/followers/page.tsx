"use client";

import UserGrid from "@/components/ui/social/UserGrid";
import LoadingSkeleton from "@/components/ui/social/LoadingSkeleton";
import { UserCardData } from "@/components/ui/social/UserCard";
import { useParams } from "next/navigation";

// ─── Mock data matching the API response shape ────────────────
const MOCK_FOLLOWERS: UserCardData[] = [
  { id: "1", username: "eimear",    followerCount: 562_000, isVerified: true, isFollowing: true, avatarSrc: "https://picsum.photos/seed/a/200" },
  { id: "2", username: "kevin",     followerCount: 1_080_000, isVerified: true, isFollowing: true, avatarSrc: "https://picsum.photos/seed/b/200" },
  { id: "3", username: "leahwilson",followerCount: 3_620_000, isVerified: true, isFollowing: false, avatarSrc: "https://picsum.photos/seed/c/200" },
  { id: "4", username: "aixuantran",followerCount: 4_620_000, isVerified: false, isFollowing: false, avatarSrc: "https://picsum.photos/seed/d/200" },
  { id: "5", username: "trvc",      followerCount: 3_000_000, isVerified: true, isFollowing: true, avatarSrc: "https://picsum.photos/seed/e/200" },
  { id: "6", username: "oceana",    followerCount: 3_800_000, isVerified: false, isFollowing: false, avatarSrc: "https://picsum.photos/seed/f/200" },
];

// const MOCK_PROFILE = {
//   username: "oliviarodrigo",
//   avatarSrc: "https://picsum.photos/seed/olivia/200",
// };

interface FollowersPageProps {
  /** Injected by Next.js from the URL segment */
  params: { username: string };
  /** Followers list — fetched from GET /users/{userId}/followers */
  followers?: typeof MOCK_FOLLOWERS;
  isLoading?: boolean;
  onFollowToggle?: (userId: string) => void;
}

/**
 * FollowersPage — /[username]/followers
 *
 * Data shape from API:
 *   GET /users/{userId}/followers
 *   → { content: Follower[], pageNumber, pageSize, totalElements, totalPages }
 *
 * followerToUserCardData() adapts Follower → UserCardData so UserCard
 * is reused without modification.
 */
export default function FollowersPage({
  followers = MOCK_FOLLOWERS,
  isLoading = false,
  onFollowToggle,
}: FollowersPageProps) {
    const { username } = useParams<{ username: string }>();
  

  return (
    <div className="max-w-[1180px] mx-auto px-6 pt-8 pb-16">

      {/* ── Grid ── */}
      {isLoading ? (
        <LoadingSkeleton variant="user-card" count={12} />
      ) : (
        <UserGrid
          users={followers}
          onFollowToggle={onFollowToggle}
        //   isOwnProfile={false}
          emptyTitle={`${username} has no followers yet`}
        />
      )}
    </div>
  );
}