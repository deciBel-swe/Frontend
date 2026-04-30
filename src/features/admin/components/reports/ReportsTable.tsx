// ─── Report Table ─────────────────────────────────────────────────────────────

import { ReportTableRow } from "./ReportsDashboard";
import { FilterDropdown } from "@/components/nav/FilterDropdown";

import { FC } from 'react';
import {
  ReportRow,
  ReportReason,
  ReportType,
} from '@/features/admin/types/types';
import {
  SectionHeader,
//   Avatar,
} from '@/features/admin/shared';

const TABLE_HEADERS = ['user', 'type', 'reason', 'date', 'status', 'actions'];

interface ReportsTableProps {
  items: ReportRow[];
  typeFilter?: string;
  reasonFilter?: string;
  onTypeFilterChange?: (v: string) => void;
  onReasonFilterChange?: (v: string) => void;
  onView?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const TYPE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'track', value: ReportType.TRACK },
  { label: 'comment', value: ReportType.COMMENT },
];

const REASON_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'unknown', value: ReportReason.UNKNOWN },
  { label: 'copyright', value: ReportReason.COPYRIGHT },
  { label: 'inappropriate', value: ReportReason.INAPPROPRIATE },
  { label: 'violence', value: ReportReason.VIOLENCE },
  { label: 'spam', value: ReportReason.SPAM },
];

/**
 * ReportsTable - Filterable table of flagged content reports.
 */
export const ReportsTable: FC<ReportsTableProps> = ({
  items,
  typeFilter = '',
  reasonFilter = '',
  onTypeFilterChange,
  onReasonFilterChange,
  onView,
  onDismiss,
}) => (
  <div>
    {/* Header row: label + filters */}
    <div className="flex items-center justify-between mb-3">
      <SectionHeader
        title="Flagged Content"
        count={`${items.length.toLocaleString()} items`}
      />
      <div className="flex gap-2">
        <span className="text-xs text-text-muted mt-2"> Filter by type </span>
        <FilterDropdown
          value={typeFilter}
          options={TYPE_OPTIONS}
          onChange={(v) => onTypeFilterChange?.(v)}
        />
        <span className="text-xs text-text-muted mt-2"> Filter by reason </span>
        <FilterDropdown
          value={reasonFilter}
          options={REASON_OPTIONS}
          onChange={(v) => onReasonFilterChange?.(v)}
        />
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto rounded-lg border border-border-default">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-default bg-bg-subtle">
            {TABLE_HEADERS.map((h) => (
              <th
                key={h}
                className="py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={TABLE_HEADERS.length}
                className="py-6 text-center text-sm text-text-muted"
              >
                No reports match the current filters
              </td>
            </tr>
          ) : (
            items.map((row) => (
              <ReportTableRow
                key={row.id}
                {...row}
                onView={onView}
                onDismiss={onDismiss}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
