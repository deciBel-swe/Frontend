import { FC } from "react";
import { ArtistListenerRatio } from "../../types/types";

/**
 * ArtistListenerRatioWidget - Donut-style ratio display using SVG.
 * Renders artist vs listener split without any charting library dependency.
 */
export const ArtistListenerRatioWidget: FC<ArtistListenerRatio> = ({
  artistCount,
  listenerCount,
  artistPercent,
  listenerPercent,
}) => {
  // SVG donut math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const artistDash = (artistPercent / 100) * circumference;

  return (
    <div className="bg-surface-default border border-border-default rounded-lg p-4 flex items-center gap-6">
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">
          Artist to Listener ratio
        </p>
        {/* SVG Donut */}
        <svg width="100" height="100" viewBox="0 0 100 100" className="block mx-auto">
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-text-primary)"
            strokeWidth="16"
          />
          {/* Artist segment */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-brand-primary)"
            strokeWidth="16"
            strokeDasharray={`${artistDash} ${circumference - artistDash}`}
            strokeDashoffset={circumference / 4}
            strokeLinecap="butt"
          />
        </svg>
      </div>
      {/* Legend */}
      <ul className="space-y-2 text-xs">
        <li className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-brand-primary shrink-0" />
          <span className="text-text-secondary">
            Artist{' '}
            <span className="text-text-primary font-semibold">{artistPercent}%</span>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-text-primary shrink-0" />
          <span className="text-text-secondary">
            Listener{' '}
            <span className="text-text-primary font-semibold">{listenerPercent}%</span>
          </span>
        </li>
        <li className="text-text-muted pt-1">
          {artistCount.toLocaleString()} / {listenerCount.toLocaleString()}
        </li>
      </ul>
    </div>
  );
};
