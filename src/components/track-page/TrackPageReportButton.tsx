'use client';

import Button from '@/components/buttons/Button';

type TrackPageReportButtonProps = {
  onReport: () => void;
};

export default function TrackPageReportButton({
  onReport,
}: TrackPageReportButtonProps) {
  return (
    <div className="flex justify-end px-1 py-2">
      <Button
        variant="secondary"
        onClick={onReport}
        aria-label="Report track"
        className="flex items-center gap-1.5 text-sm px-2 py-1.5 rounded hover:text-status-error"
      >
        <span>Report track</span>
      </Button>
    </div>
  );
}
