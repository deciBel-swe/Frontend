import Link from 'next/link';
import { Info } from 'lucide-react';

export type Fan = {
  id: string | number;
  name: string;
  slug: string;
  avatarUrl: string;
  plays: number;
};

type TrackFansPanelProps = {
  fans: Fan[];
};

export default function TrackFansPanel({ fans }: TrackFansPanelProps) {
  if (fans.length === 0) return null;

  return (
    <div className="py-4 border-t border-border-default lg:border-t-0">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-sm font-bold text-text-primary uppercase tracking-wide">
          Fans
        </span>
        <Info size={13} className="text-text-muted" />
      </div>

      {/* Tab (Top only for now) */}
      <div className="text-xs font-semibold text-text-primary border-b border-border-default pb-1.5 mb-3">
        Top
      </div>

      <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">
        Fans who have played this track the most:
      </p>

      {/* Fan rows */}
      <ol className="flex flex-col gap-2">
        {fans.map((fan, idx) => (
          <li key={fan.id} className="flex items-center gap-2">
            <span className="text-xs text-text-muted w-4 text-right flex-shrink-0">
              {idx + 1}
            </span>
            <Link href={`/${fan.slug}`} className="flex items-center gap-2 flex-1 min-w-0 group">
              <img
                src={fan.avatarUrl}
                alt={fan.name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 group-hover:opacity-80 transition-opacity"
              />
              <span className="text-sm text-text-primary group-hover:text-brand-primary transition-colors truncate">
                {fan.name}
              </span>
            </Link>
            <span className="text-xs text-text-muted flex-shrink-0">
              {fan.plays.toLocaleString()} plays
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}