"use client";

import UserGrid from "@/components/ui/social/UserGrid";
import LoadingSkeleton from "@/components/ui/social/LoadingSkeleton";
import { UserCardData } from "@/components/ui/social/UserCard";

// ─── Mock data ────────────────────────────────────────────────
const MOCK_SUGGESTED: UserCardData[] = [
  { id: "1",  username: "Gracie",            followerCount: 89_900,   isVerified: true,  isFollowing: true,  avatarSrc: "https://picsum.photos/seed/ff/200" },
  { id: "2",  username: "redwitch",          followerCount: 12_300,   isVerified: false, isFollowing: false, avatarSrc: "https://picsum.photos/seed/gg/200" },
  { id: "3",  username: "nightlane",         followerCount: 98_000,   isVerified: false, isFollowing: false, avatarSrc: "https://picsum.photos/seed/hh/200" },
  { id: "4",  username: "solstice",          followerCount: 450_000,  isVerified: true,  isFollowing: false, avatarSrc: "https://picsum.photos/seed/ii/200" },
  { id: "5", username: "kairosound",        followerCount: 6_200,    isVerified: false, isFollowing: true,  avatarSrc: "https://picsum.photos/seed/jj/200" },
  { id: "6", username: "dawnbreak",         followerCount: 210_000,  isVerified: true,  isFollowing: false, avatarSrc: "https://picsum.photos/seed/kk/200" },
  { id: "7", username: "velvetpulse",       followerCount: 33_500,   isVerified: false, isFollowing: false, avatarSrc: "https://picsum.photos/seed/ll/200" },
];

interface PeoplePageProps {
  users?: UserCardData[];
  isLoading?: boolean;
  onFollowToggle?: (userId: string) => void;
}

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
export default function Page({
  users = MOCK_SUGGESTED,
  isLoading = false,
  onFollowToggle,
}: PeoplePageProps) {
  return (
    <div className="max-w-[1180px] mx-auto px-6 pt-8 pb-16">

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
          onFollowToggle={onFollowToggle}
          emptyTitle="No suggestions right now. Follow some artists to get started."
        />
      )}
    </div>
  );
}