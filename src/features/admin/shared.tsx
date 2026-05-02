import { FC, ReactNode } from 'react';
import { ReportReason, ReportStatus, UserStatus } from '@/features/admin/types/types';
// export { Avatar } from '@/components/avatars/Avatar';
// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  /** Highlighted label (orange) */
  title: string;
  /** Dimmed item count label */
  count?: string;
}

/**
 * SectionHeader - Orange bold label with a secondary item count.
 * @example <SectionHeader title="All users" count="11,678 items" />
 */
export const SectionHeader: FC<SectionHeaderProps> = ({ title, count }) => (
  <p className="text-sm font-semibold">
    <span className="text-brand-primary">{title}</span>
    {count && <span className="text-text-muted font-normal"> - {count}</span>}
  </p>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Optional sub-line below the value */
  sub?: ReactNode;
}

/**
 * StatCard - Small metric card with a label, prominent value, and optional sub-content.
 */
export const StatCard: FC<StatCardProps> = ({ label, value, sub }) => (
  <div className="bg-surface-default border border-border-default rounded-lg p-4 min-w-[120px]">
    <p className="text-text-muted text-xs mb-1">{label}</p>
    <p className="text-brand-primary text-xl font-bold leading-tight">{value}</p>
    {sub && <div className="text-text-secondary text-xs mt-1">{sub}</div>}
  </div>
);

// ─── Reason Badge ─────────────────────────────────────────────────────────────

const REASON_STYLES: Record<ReportReason, string> = {
  [ReportReason.UNKNOWN]: 'bg-neutral-200 text-neutral-700',
  [ReportReason.COPYRIGHT]: 'bg-green-100 text-green-700',
  [ReportReason.INAPPROPRIATE]: 'bg-orange-100 text-orange-700',
  [ReportReason.VIOLENCE]: 'bg-pink-100 text-pink-700',
  [ReportReason.SPAM]: 'bg-yellow-100 text-yellow-700',
};

interface ReasonBadgeProps {
  reason: ReportReason;
}

/**
 * ReasonBadge - Colour-coded pill indicating the report reason.
 */
export const ReasonBadge: FC<ReasonBadgeProps> = ({ reason }) => (
  <span
    className='px-2 py-0.5 rounded text-xs font-medium capitalize'
    style={{ backgroundColor: REASON_STYLES[reason].split(' ')[0], color: REASON_STYLES[reason].split(' ')[1] }}
  >
    {reason}
  </span>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const REPORT_STATUS_STYLES: Record<ReportStatus, string> = {
  [ReportStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
  [ReportStatus.RESOLVED]: 'bg-green-100 text-green-700',
  [ReportStatus.DISMISSED]: 'bg-neutral-200 text-neutral-500',
};

const USER_STATUS_STYLES: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'bg-green-100 text-green-700',
  [UserStatus.SUSPENDED]: 'bg-orange-100 text-orange-700',
};

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

/**
 * ReportStatusBadge - Colour-coded pill for a report's status.
 */
export const ReportStatusBadge: FC<ReportStatusBadgeProps> = ({ status }) => (
  <span
    className='px-2 py-0.5 rounded text-xs font-medium capitalize'
    style={{ backgroundColor: REPORT_STATUS_STYLES[status].split(' ')[0], color: REPORT_STATUS_STYLES[status].split(' ')[1] }}
  >
    {status}
  </span>
);

interface UserStatusBadgeProps {
  status: UserStatus;
}

/**
 * UserStatusBadge - Colour-coded pill for a user's account status.
 */
export const UserStatusBadge: FC<UserStatusBadgeProps> = ({ status }) => (
  <span
    className='px-2 py-0.5 rounded text-xs font-medium capitalize'
    style={{ backgroundColor: USER_STATUS_STYLES[status].split(' ')[0], color: USER_STATUS_STYLES[status].split(' ')[1] }}
  >
    {status}
  </span>
);


