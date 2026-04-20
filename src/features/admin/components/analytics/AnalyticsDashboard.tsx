import { FC } from 'react';
import {
  AnalyticsDashboardData,
} from '@/features/admin/types/types';
import { StorageCard } from '@/features/admin/components/analytics/StorageCard';
import { ArtistListenerRatioWidget } from '@/features/admin/components/analytics/ArtistListenerRatioWidget';

// ─── Analytics Dashboard (assembled) ─────────────────────────────────────────

interface AnalyticsDashboardProps {
  data: AnalyticsDashboardData;
}
/**
 * AnalyticsDashboard - Full analytics tab view composed from sub-widgets.
 */
export const AnalyticsDashboard: FC<AnalyticsDashboardProps> = ({ data }) => {
  const { plays, totalUsers, storage, artistListenerRatio } = data;

  return (
    <div className="space-y-4">
      {/* ── Top stat row ── */}
      <div className="flex flex-wrap gap-3">
        {/* Plays */}
        <div className="bg-surface-default border border-border-default rounded-lg p-4 min-w-[120px]">
          <p className="text-text-muted text-xs mb-1">{plays.label}</p>
          <p className="text-brand-primary text-xl font-bold">{plays.value}</p>
        </div>
        {/* Total Users */}
        <div className="bg-surface-default border border-border-default rounded-lg p-4 min-w-[120px]">
          <p className="text-text-muted text-xs mb-1">{totalUsers.label}</p>
          <p className="text-brand-primary text-xl font-bold">{totalUsers.value}</p>
        </div>
        {/* Storage */}
        <StorageCard {...storage} />
      </div>

      {/* ── Bottom widgets row ── */}
      <div className="flex flex-wrap gap-3">
        <ArtistListenerRatioWidget {...artistListenerRatio} />
      </div>
    </div>
  );
};