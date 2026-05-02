import Image from 'next/image';
import { FC } from 'react';

import { ReportDetail } from '@/features/admin/types/types';

interface ReportedTrackPanelProps {
  track: NonNullable<ReportDetail['track']>;
}

export const ReportedTrackPanel: FC<ReportedTrackPanelProps> = ({ track }) => (
  <div className="flex-1 min-w-[200px]">
    <p className="text-brand-primary text-sm font-semibold mb-3">
      Reported track
    </p>
    <div className="bg-bg-subtle rounded-lg overflow-hidden border border-border-default">
      {track.thumbnailUrl ? (
        <div className="relative w-full h-28">
          <Image
            src={track.thumbnailUrl}
            alt={track.trackTitle}
            fill
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="p-2 space-y-0.5">
        <p className="text-text-primary text-xs font-medium">{track.trackTitle}</p>
        {track.artistName ? (
          <p className="text-text-secondary text-xs">{track.artistName}</p>
        ) : null}
        {track.plays ? (
          <p className="text-text-muted text-xs">plays: {track.plays}</p>
        ) : null}
        {track.uploadedDate ? (
          <p className="text-text-muted text-xs">uploaded: {track.uploadedDate}</p>
        ) : null}
      </div>
    </div>
  </div>
);
