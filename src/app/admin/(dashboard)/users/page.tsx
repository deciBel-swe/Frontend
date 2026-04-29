'use client';

import { useMemo } from 'react';

import { UsersDashboard } from '@/features/admin/components/users/UsersDashboard';
import { useBannedUsers, useUnbanUser } from '@/features/admin/hooks';
import type { UserRow, UsersDashboardData } from '@/features/admin/types/types';

export default function AdminUsersPage() {
  const {
    users: bannedUsersResponse,
    getBannedUsers,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
  } = useBannedUsers({ page: 0, size: 20 });
  const { unbanUser, isLoading, isError, error } = useUnbanUser();

  const users = useMemo<UserRow[]>(
    () =>
      (bannedUsersResponse?.content ?? []).map((user) => ({
        id: String(user.id),
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        followerCount: user.followerCount,
        trackCount: user.trackCount,
      })),
    [bannedUsersResponse]
  );

  const dashboardData = useMemo<UsersDashboardData>(
    () => ({
      bannedCount: bannedUsersResponse?.bannedUserCount ?? users.length,
      users,
    }),
    [bannedUsersResponse, users]
  );

  const handleReinstate = async (id: string) => {
    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      return;
    }

    try {
      await unbanUser(userId);
      await getBannedUsers();
    } catch {
      // The hook already exposes the error state for the page message.
    }
  };

  if (isUsersLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-text-muted">Loading banned users...</p>
      </main>
    );
  }

  if (isUsersError) {
    return (
      <main className="p-6 space-y-4">
        <p className="text-sm text-status-error">
          {usersError?.message ?? 'Unable to load banned users.'}
        </p>
        <button
          type="button"
          className="text-sm text-accent-primary underline"
          onClick={() => void getBannedUsers()}
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <UsersDashboard
        data={dashboardData}
        onReinstate={(id) => void handleReinstate(id)}
      />
      {isLoading && (
        <p className="text-sm text-text-muted">Updating user status...</p>
      )}
      {isError && (
        <p className="text-sm text-status-error">
          {error?.message ?? 'Unable to update user status.'}
        </p>
      )}
    </main>
  );
}
