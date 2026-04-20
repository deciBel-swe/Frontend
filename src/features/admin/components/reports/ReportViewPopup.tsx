/**
 * @description Modal popup showing full detail of a flagged report.
 * Stateless: data and action callbacks injected via props.
 */

import { FC, JSX } from 'react';
import { ReportDetail, ReportType } from '@/features/admin/types/types';
import { ActionButton, ReportStatusBadge } from '@/features/admin/shared';
import { ReportedTrackPanel } from './ReportedTrackPannel';
import { ReportedCommentPanel } from './ReportedCommentPannel';

// ─── Report Info Panel ────────────────────────────────────────────────────────

interface ReportInfoPanelProps {
  detail: ReportDetail;
}

/**
 * ReportInfoPanel - Left column showing the report metadata fields.
 */
const ReportInfoPanel: FC<ReportInfoPanelProps> = ({ detail }) => {
  const fields: { label: string; value: string | JSX.Element }[] = [
    { label: 'reason', value: detail.reason },
    { label: 'type', value: detail.type },
    { label: 'reported by', value: detail.reportedBy },
    { label: 'date', value: detail.date },
    {
      label: 'status',
      value: <ReportStatusBadge status={detail.status} />,
    },
    { label: 'description', value: detail.description ?? '—' },
  ];

  return (
    <div className="flex-1 min-w-[180px]">
      <p className="text-brand-primary text-sm font-semibold mb-3">Report info</p>
      <dl className="space-y-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex gap-3">
            <dt className="text-text-muted text-xs w-24 shrink-0 capitalize">{label}</dt>
            <dd className="text-text-primary text-xs">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

// ─── Action Bar ───────────────────────────────────────────────────────────────

interface ActionBarProps {
  onRemove?: () => void;
  onDismiss?: () => void;
  onSuspendUser?: () => void;
}

/**
 * ActionBar - Bottom action strip inside the report view popup.
 */
const ActionBar: FC<ActionBarProps> = ({ onRemove, onDismiss, onSuspendUser }) => (
  <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border-default">
    <span className="text-brand-primary text-sm font-semibold">Action:</span>
    <ActionButton label="remove" variant="default" onClick={onRemove} />
    <ActionButton label="dismiss" variant="yellow" onClick={onDismiss} />
    <ActionButton label="suspend user" variant="red" onClick={onSuspendUser} />
  </div>
);

// ─── Report View Popup ────────────────────────────────────────────────────────

interface ReportViewPopupProps {
  detail: ReportDetail;
  onClose?: () => void;
  onRemove?: () => void;
  onDismiss?: () => void;
  onSuspendUser?: () => void;
}

/**
 * ReportViewPopup - Full-detail overlay for a single flagged report.
 * Shows report info, the reported track, and (if applicable) the reported comment.
 * All action handlers are optional injected callbacks.
 *
 * @example
 * <ReportViewPopup
 *   detail={selectedReport}
 *   onClose={() => setSelectedReport(null)}
 *   onRemove={() => handleRemove(selectedReport.id)}
 * />
 */
export const ReportViewPopup: FC<ReportViewPopupProps> = ({
  detail,
  onClose,
  onRemove,
  onDismiss,
  onSuspendUser,
}) => (
  /* Backdrop */
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay"
    onClick={onClose}
  >
    {/* Panel */}
    <div
      className="
        relative bg-surface-default border border-border-default rounded-xl
        shadow-2xl p-6 w-full max-w-3xl mx-4
        animate-drop-in
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="
          absolute top-3 right-3 text-text-muted hover:text-text-primary
          text-lg leading-none transition-colors
        "
        aria-label="Close"
      >
        ✕
      </button>

      {/* Columns */}
      <div className="flex flex-wrap gap-6">
        <ReportInfoPanel detail={detail} />
        {detail.track && <ReportedTrackPanel track={detail.track} />}
        {detail.type === ReportType.COMMENT && detail.comment && (
          <ReportedCommentPanel comment={detail.comment} />
        )}
      </div>

      <ActionBar
        onRemove={onRemove}
        onDismiss={onDismiss}
        onSuspendUser={onSuspendUser}
      />
    </div>
  </div>
);