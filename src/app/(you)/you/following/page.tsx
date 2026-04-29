'use client';
import React from "react";

import FilterBar from "@/components/nav/FilterBar";
import UserGrid from "@/features/social/UserGrid";
import LoadingSkeleton from "@/features/social/LoadingSkeleton";
import { useAuth } from '@/features/auth';
import { useFollowing } from '@/hooks/useFollowing';

/**
 * LibraryFollowingPage — /you/following
 *
 * Shows a 6-column grid of artists/users the current user follows.
 * Part of the Library section (tabbed alongside Likes, Playlists, etc.)
 *
 * Stateless: all data flows in as props.
 */
export default function Page() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    users,
    isLoading,
    hasMore,
    isPaginating,
    sentinelRef,
  } = useFollowing({
    username: user?.username ?? '',
    size: 12,
    infinite: true,
  });
  const [filterValue, setFilterValue] = React.useState("");

  const filtered = filterValue
    ? users.filter(
        (u) =>
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
      {isAuthLoading || isLoading ? (
        <LoadingSkeleton variant="user-card" count={6} />
      ) : (
        <UserGrid
          users={filtered}
          showFollowButton={false}
          emptyTitle="Not following anyone yet"
          emptyDescription="Find artists and people you love to follow them here."
          hasMore={hasMore}
          isPaginating={isPaginating}
          sentinelRef={sentinelRef}
        />
      )}
    </div>
  );
}
