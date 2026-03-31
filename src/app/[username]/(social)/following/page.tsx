"use client";

import UserGrid from "@/components/ui/social/UserGrid";
import LoadingSkeleton from "@/components/ui/social/LoadingSkeleton";
// import { followerToUserCardData } from "@/types/follower";
// import type { Follower } from "@/types/follower";
import { UserCardData } from "@/components/ui/social/UserCard";
import { usePublicUser } from "@/features/prof/hooks/usePublicUser";
import { useParams } from "next/navigation";

// ─── Mock data ───────────────────
const MOCK_FOLLOWING: UserCardData[] = [
  {
    id: "1",
    username: "mockuser1",
    followerCount: 562_000,
    isVerified: true,
    isFollowing: true,
    avatarSrc: 'https://picsum.photos/seed/cover/400/400',
  },
  {
    id: "2",
    username: "mockuser2",
    followerCount: 1_080_000,
    isVerified: true,
    isFollowing: true,
    avatarSrc: undefined,
  },
  {
    id: "3",
    username: "mockuser3",
    followerCount: 3_620_000,
    isVerified: true,
    isFollowing: true,
    avatarSrc: undefined,
  },
    {
    id: "4",
    username: "mockuser4",
    followerCount: 4_620_000,
    isVerified: false,
    isFollowing: true,
    avatarSrc: undefined,
  },
];


interface ProfileFollowingPageProps {
    users?: UserCardData[];
    isLoading?: boolean;
    onFollowToggle?: (userId: string) => void;
}

/**
 * ProfileFollowingPage — /[username]/following
 *
 * Different from /you/following:
 *   /[username]/following  → shows who ANOTHER user follows, with Follow buttons
 *   /you/following         → shows who YOU follow, no Follow buttons, in Library layout
 *
 * Both use the same Follower type and followerToUserCardData adapter.
 */
export default function ProfileFollowingPage({
    users = MOCK_FOLLOWING,
    isLoading = false,
    onFollowToggle,
}: ProfileFollowingPageProps) {

    const { username } = useParams<{ username: string }>();
    const { data: profileData } = usePublicUser(username);

  return (
    <div className="max-w-[1180px] mx-auto px-6 pt-8 pb-16">

      {/* ── Grid ── */}
      {isLoading ? (
        <LoadingSkeleton variant="user-card" count={12} />
      ) : (
        <UserGrid
          users={users}
          onFollowToggle={onFollowToggle}
          emptyTitle={`${profileData?.profile.username} isn't following anyone yet`}
        />
      )}
    </div>
  );
}