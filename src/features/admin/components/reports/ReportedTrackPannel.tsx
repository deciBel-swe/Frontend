import { FC } from 'react';
import { ReportDetail } from '@/features/admin/types/types';

// ─── Reported Track Panel ─────────────────────────────────────────────────────

interface ReportedTrackPanelProps {
  track: NonNullable<ReportDetail['track']>;
}

/**
 * ReportedTrackPanel - Middle column showing track thumbnail and metadata.
 */
export const ReportedTrackPanel: FC<ReportedTrackPanelProps> = ({ track }) => (
  <div className="flex-1 min-w-[200px]">
    <p className="text-brand-primary text-sm font-semibold mb-3">Reported track</p>
    <div className="bg-bg-subtle rounded-lg overflow-hidden border border-border-default">
      <img
        src={track.thumbnailUrl}
        alt={track.trackTitle}
        className="w-full h-28 object-cover"
      />
      <div className="p-2 space-y-0.5">
        <p className="text-text-primary text-xs font-medium">{track.trackTitle}</p>
        <p className="text-text-secondary text-xs">{track.artistName}</p>
        <p className="text-text-muted text-xs">plays: {track.plays}</p>
        <p className="text-text-muted text-xs">uploaded: {track.uploadedDate}</p>
      </div>
    </div>
  </div>
);