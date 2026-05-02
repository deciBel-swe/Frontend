import { FC } from 'react';

import { StorageCard } from '@/features/admin/components/analytics/StorageCard';
import { StatCard } from '@/features/admin/shared';
import { AnalyticsDashboardData } from '@/features/admin/types/types';

interface AnalyticsDashboardProps {
  data: AnalyticsDashboardData;
}

export const AnalyticsDashboard: FC<AnalyticsDashboardProps> = ({ data }) => {
  const {
    plays,
    totalUsers,
    totalTracks,
    playThroughRate,
    bannedUsers,
    storage,
  } = data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <StatCard label={plays.label} value={plays.value} />
        <StatCard label={totalUsers.label} value={totalUsers.value} />
        <StatCard label={totalTracks.label} value={totalTracks.value} />
        <StatCard
          label={playThroughRate.label}
          value={playThroughRate.value}
        />
        <StatCard label={bannedUsers.label} value={bannedUsers.value} />
        <StorageCard {...storage} />
      </div>
    </div>
  );
};
