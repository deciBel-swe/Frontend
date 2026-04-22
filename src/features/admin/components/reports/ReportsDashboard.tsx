/**
 * @description Reports tab — summary cards + flagged content table.
 */

import { FC } from 'react';
import { ReportsStatistics } from './ReportsStatistics';
// import { AvatarImage } from '@/components/notifications/AvatarImage';
import {
  ReportsDashboardData,
  ReportRow,
} from '@/features/admin/types/types';
import {
//   Avatar,
  ReasonBadge,
  ReportStatusBadge,
//   ActionButton,
} from '@/features/admin/shared';
import { ReportsTable } from './ReportsTable';
import Button from '@/components/buttons/Button'

// ─── Report Table Row ─────────────────────────────────────────────────────────

interface ReportTableRowProps extends ReportRow {
  onView?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

/**
 * ReportTableRow - Single row in the flagged content table.
 */
export const ReportTableRow: FC<ReportTableRowProps> = ({
  id,
  user,
  type,
  reason,
  date,
  status,
  onView,
  onDismiss,
}) => (
  <tr className="border-b border-border-default hover:bg-bg-subtle transition-colors">
    <td className="py-2 px-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-primary">{user}</span>
      </div>
    </td>
    <td className="py-2 px-3 text-sm text-text-secondary capitalize">{type}</td>
    <td className="py-2 px-3">
      <ReasonBadge reason={reason} />
    </td>
    <td className="py-2 px-3 text-sm text-text-secondary">{date}</td>
    <td className="py-2 px-3">
      <ReportStatusBadge status={status} />
    </td>
     <td className="py-2 px-3">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          id="view"
          variant="secondary"
          onClick={() => onView?.(id)}
        >
          view
        </Button>
        <Button
          size="sm"
          id="dismiss"
          variant="danger"
          onClick={() => onDismiss?.(id)}
        >
          dismiss
        </Button>
      </div>
    </td>
  </tr>
);



// ─── Reports Dashboard (assembled) ───────────────────────────────────────────

interface ReportsDashboardProps {
  data: ReportsDashboardData;
  typeFilter?: string;
  reasonFilter?: string;
  onTypeFilterChange?: (v: string) => void;
  onReasonFilterChange?: (v: string) => void;
  onView?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

/**
 * ReportsDashboard - Full reports tab view.
 */
export const ReportsDashboard: FC<ReportsDashboardProps> = ({
  data,
  typeFilter,
  reasonFilter,
  onTypeFilterChange,
  onReasonFilterChange,
  onView,
  onDismiss,
}) => (
  <div>
    <ReportsStatistics
      totalReports={data.totalReports}
      resolved={data.resolved}
    />
    <ReportsTable
      items={data.flaggedItems.items}
      typeFilter={typeFilter}
      reasonFilter={reasonFilter}
      onTypeFilterChange={onTypeFilterChange}
      onReasonFilterChange={onReasonFilterChange}
      onView={onView}
      onDismiss={onDismiss}
    />
  </div>
);