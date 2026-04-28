'use client';

/**
 * @file ReportModal.tsx
 * @description A shared modal component for reporting tracks or comments.
 * Allows the user to select a reason and optionally add additional context
 * before submitting a report to the moderation system.
 */

import { useState } from 'react';
import { X, Flag, AlertTriangle, Loader2 } from 'lucide-react';
import Button from '@/components/buttons/Button';

/** The subject type being reported. */
export type ReportTarget = 'track' | 'comment';

/** Predefined report reason options surfaced to the user. */
export const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam or misleading' },
  { value: 'HATE_SPEECH', label: 'Hate speech or discrimination' },
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'COPYRIGHT', label: 'Copyright infringement' },
  { value: 'VIOLENCE', label: 'Violence or dangerous content' },
  { value: 'ADULT_CONTENT', label: 'Explicit / adult content' },
  { value: 'OTHER', label: 'Something else' },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]['value'];

export type ReportModalProps = {
  /** Whether the modal is visible. */
  isOpen: boolean;
  /** What entity is being reported — affects the modal title copy. */
  target: ReportTarget;
  /** Whether the submission is in-flight. */
  isSubmitting?: boolean;
  /** Called when the user cancels or clicks outside. */
  onClose: () => void;
  /**
   * Called when the user confirms the report.
   * @param reason - The selected reason code.
   * @param details - Optional free-text elaboration.
   */
  onSubmit: (reason: ReportReason, details?: string) => void;
};

/**
 * ReportModal
 *
 * Renders a focused modal that lets users report a track or comment for
 * policy violations. The modal is self-contained: it manages its own
 * local form state and resets on close.
 *
 * @example
 * ```tsx
 * <ReportModal
 *   isOpen={isReportOpen}
 *   target="track"
 *   isSubmitting={isSubmitting}
 *   onClose={() => setIsReportOpen(false)}
 *   onSubmit={(reason, details) => handleReport(reason, details)}
 * />
 * ```
 */
export default function ReportModal({
  isOpen,
  target,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setSelectedReason(null);
    setDetails('');
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedReason || isSubmitting) return;
    onSubmit(selectedReason, details.trim() || undefined);
  };

  const targetLabel = target === 'track' ? 'track' : 'comment';

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
      aria-label={`Report ${targetLabel}`}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-xl bg-surface-default border border-border-default shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
          <div className="flex items-center gap-2 text-status-error">
            <Flag size={16} />
            <h2 className="text-sm font-semibold text-text-primary">
              Report {targetLabel}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          <p className="text-xs text-text-muted">
            Help us understand what&apos;s wrong with this {targetLabel}. We review every report.
          </p>

          {/* Reason list */}
          <fieldset>
            <legend className="sr-only">Select a reason</legend>
            <ul className="flex flex-col gap-1.5">
              {REPORT_REASONS.map(({ value, label }) => (
                <li key={value}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="report-reason"
                      value={value}
                      checked={selectedReason === value}
                      onChange={() => setSelectedReason(value)}
                      className="accent-brand-primary"
                      disabled={isSubmitting}
                    />
                    <span
                      className={`text-sm transition-colors ${
                        selectedReason === value
                          ? 'text-text-primary font-medium'
                          : 'text-text-muted group-hover:text-text-primary'
                      }`}
                    >
                      {label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          {/* Optional details */}
          {selectedReason && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="report-details"
                className="text-xs text-text-muted"
              >
                Additional context{' '}
                <span className="text-text-muted/60">(optional)</span>
              </label>
              <textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={500}
                rows={3}
                disabled={isSubmitting}
                placeholder="Describe the issue..."
                className="w-full rounded-md bg-surface-elevated border border-border-default px-3 py-2 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-50 transition"
              />
              <span className="text-right text-xs text-text-muted/60">
                {details.length}/500
              </span>
            </div>
          )}

          {/* Warning note */}
          <div className="flex items-start gap-2 rounded-lg bg-status-warning/10 border border-status-warning/20 px-3 py-2.5">
            <AlertTriangle size={13} className="text-status-warning mt-0.5 shrink-0" />
            <p className="text-xs text-text-muted">
              Repeated false reports may result in account restrictions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border-default px-5 py-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-sm"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="text-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Flag size={13} />
                Submit report
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}