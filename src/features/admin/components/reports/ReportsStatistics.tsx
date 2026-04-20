// ─── Reports Summary Cards ────────────────────────────────────────────────────

import { FC } from "react";
import { ProgressBar } from '../ProgressBar';

interface ReportsStatisticsProps {
  totalReports: number;
  resolved: { count: number; total: number; percent: number };
}

/**
 * ReportsStatistics - Two stat cards: total reports and resolved progress bar.
 */
export const ReportsStatistics: FC<ReportsStatisticsProps> = ({
  totalReports,
  resolved,
}) => (
  <div className="flex flex-wrap gap-3 mb-4">
    <div className="bg-surface-default border border-border-default rounded-lg p-4 min-w-[140px]">
      <p className="text-text-muted text-xs mb-1">Total reports</p>
      <p className="text-brand-primary text-xl font-bold">{totalReports}</p>
    </div>
    <div className="bg-surface-default border border-border-default rounded-lg p-4 min-w-[160px] flex-1 max-w-xs">
      <p className="text-text-muted text-xs mb-2">Resolved</p>
      <p className="text-text-secondary text-xs mb-2">
        {resolved.count} / {resolved.total}
      </p>
      <ProgressBar percent={resolved.percent} />
      <p className="text-text-secondary text-xs mt-1">{resolved.percent}%</p>
    </div>
  </div>
);