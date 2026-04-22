'use client';

import { AnalyticsDashboard } from '@/features/admin';
import { AnalyticsDashboardData } from '@/features/admin/types/types';

const analyticsData: AnalyticsDashboardData = {
  plays: { label: 'Total Plays', value: '1.2M' },
  totalUsers: { label: 'Total Users', value: '84,231' },
  storage: {
    usedGB: 315,
  },
  // flaggedContent: {
  //   total: 148,
  //   copyright: 92,
  //   inappropriate: 56,
  // },
  // highestMonthlyActivity: {
  //   label: 'Highest Activity',
  //   value: 182300,
  //   change: '+14%',
  // },
  // lowestMonthlyActivity: {
  //   label: 'Lowest Activity',
  //   value: 41200,
  //   change: '-6%',
  // },
  artistListenerRatio: {
    artistCount: 12340,
    listenerCount: 71891,
    artistPercent: 15,
    listenerPercent: 85,
  },
};

export default function AdminAnalyticsPage() {
  return (
    <main className="p-6 space-y-6">
      <AnalyticsDashboard data={analyticsData} />
    </main>
  );
}
