'use client';

import { AnalyticsDashboard } from '@/features/admin';
import { usePlatformAnalytics } from '@/features/admin/hooks';
import type { AnalyticsDashboardData } from '@/features/admin/types/types';

const formatCompactNumber = (value: number): string =>
  new Intl.NumberFormat('en', { notation: 'compact' }).format(value);

const toGigabytes = (bytes: number): number =>
  Number((bytes / (1024 * 1024 * 1024)).toFixed(1));

const toPercentLabel = (value: number): string => `${value.toFixed(1)}%`;

const buildDashboardData = (
  totalUsers: number,
  totalTracks: number,
  totalPlays: number,
  totalStorageUsedBytes: number,
  totalStorageCapacityBytes: number,
  playThroughRate: number,
  bannedUserCount: number
): AnalyticsDashboardData => ({
  plays: { label: 'Total Plays', value: formatCompactNumber(totalPlays) },
  totalUsers: { label: 'Total Users', value: totalUsers.toLocaleString() },
  totalTracks: { label: 'Total Tracks', value: totalTracks.toLocaleString() },
  playThroughRate: {
    label: 'Play-through Rate',
    value: toPercentLabel(playThroughRate),
  },
  bannedUsers: {
    label: 'Banned Users',
    value: bannedUserCount.toLocaleString(),
  },
  storage: {
    usedGB: toGigabytes(totalStorageUsedBytes),
    totalGB: toGigabytes(totalStorageCapacityBytes),
  },
});

export default function AdminAnalyticsPage() {
  const { analytics, getPlatformAnalytics, isLoading, isError, error } =
    usePlatformAnalytics();

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-text-muted">Loading analytics...</p>
      </main>
    );
  }

  if (isError || !analytics) {
    return (
      <main className="p-6 space-y-4">
        <p className="text-sm text-status-error">
          {error?.message ?? 'Unable to load analytics.'}
        </p>
        <button
          type="button"
          onClick={() => void getPlatformAnalytics()}
          className="text-sm font-semibold text-brand-primary"
        >
          Retry
        </button>
      </main>
    );
  }

  const analyticsData = buildDashboardData(
    analytics.totalUsers,
    analytics.totalTracks,
    analytics.totalPlays,
    analytics.totalStorageUsedBytes,
    analytics.totalStorageCapacityBytes,
    analytics.playThroughRate,
    analytics.bannedUserCount
  );

  return (
    <main className="p-6 space-y-6">
      <AnalyticsDashboard data={analyticsData} />
    </main>
  );
}
