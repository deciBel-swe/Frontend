'use client';
import React from "react";
import FilterBar from "@/components/nav/FilterBar";
import UserGrid from "@/components/ui/social/UserGrid";
import LoadingSkeleton from "@/components/ui/social/LoadingSkeleton";
import { UserCardData } from "@/components/ui/social/UserCard";

// ─── Mock data ───────────────────
const MOCK_FOLLOWING: UserCardData[] = [
  {
    id: "1",
    username: "mockuser1",
    displayName: "user 1",
    followerCount: 562_000,
    isVerified: true,
    isFollowing: true,
    avatarSrc: 'https://picsum.photos/seed/cover/400/400',
  },
  {
    id: "2",
    username: "mockuser2",
    displayName: "user 2",
    followerCount: 1_080_000,
    isVerified: true,
    isFollowing: true,
    avatarSrc: undefined,
  },
  {
    id: "3",
    username: "mockuser3",
    displayName: "user 3",
    followerCount: 3_620_000,
    isVerified: true,
    isFollowing: true,
    avatarSrc: undefined,
  },
    {
    id: "4",
    username: "mockuser4",
    displayName: "user 4",
    followerCount: 4_620_000,
    isVerified: false,
    isFollowing: true,
    avatarSrc: undefined,
  },
  {
    id: "5",
    username: "mockuser5",
    displayName: "user 5",
    followerCount: 3_000_000,
    isVerified: true,
    isFollowing: true,
    avatarSrc: undefined,
  },
  {
    id: "6",
    username: "mockuser6",
    displayName: "user 6",
    followerCount: 3_800_000,
    isVerified: false,
    isFollowing: true,
    avatarSrc: undefined,
  },
  {
    id: "7",
    username: "mockuser7",
    displayName: "user 7",
    followerCount: 3_100_00,
    isVerified: false,
    isFollowing: true,
    avatarSrc: undefined,
  },
];

interface LibraryFollowingPageProps {
  /** For Storybook / testing: override the following list */
  users?: UserCardData[];
  isLoading?: boolean;
}

/**
 * LibraryFollowingPage — /you/following
 *
 * Shows a 6-column grid of artists/users the current user follows.
 * Part of the Library section (tabbed alongside Likes, Playlists, etc.)
 *
 * Stateless: all data flows in as props.
 */
export default function Page({
  users = MOCK_FOLLOWING,
  isLoading = false,
}: LibraryFollowingPageProps) {
  const [filterValue, setFilterValue] = React.useState("");

  const filtered = filterValue
    ? users.filter(
        (u) =>
          u.displayName.toLowerCase().includes(filterValue.toLowerCase()) ||
          u.username.toLowerCase().includes(filterValue.toLowerCase())
      )
    : users;

  return (
    <div
      className="sc-library-following-page"
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "0 24px 60px",
      }}
    >
      {/* ── Section header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <p>
          Hear what the people you follow have posted:
        </p>
        <FilterBar
          placeholder="Filter"
          value={filterValue}
          onChange={setFilterValue}
        />
      </div>

      {/* ── User grid ── */}
      {isLoading ? (
        <LoadingSkeleton variant="user-card" count={6} />
      ) : (
        <UserGrid
          users={filtered}
          showFollowButton={false}
          emptyTitle="Not following anyone yet"
          emptyDescription="Find artists and people you love to follow them here."
        />
      )}
    </div>
  );
}