import Link from 'next/link';
import StateItem from '@/features/prof/components/StatItem';

export type Fan = {
  id: string | number;
  name: string;
  slug: string;
  avatarUrl: string;
  plays: number;
};

type TrackFansPanelProps = {
  fans: Fan[];
  username: string;
  trackId: string | number;
  likesCount: number;
  repostsCount: number;
  commentsCount: number;
};

export default function TrackFansPanel({
  username,
  trackId,
  likesCount,
  repostsCount,
  commentsCount,
}: TrackFansPanelProps) {
  const trackPath = `/${username}/${trackId}`;
  const repostsPath = `/${username}/${trackId}/reposts`;
  const likesPath = `/${username}/${trackId}/likes`;

  return (
    <div className="py-4 border-t border-border-default lg:border-t-0">
      <div className="flex flex-nowrap mb-4 overflow-x-auto">
        <Link href={trackPath}>
          <StateItem count={commentsCount} text="Comments" />
        </Link>
        <Link href={repostsPath}>
          <StateItem count={repostsCount} text="Reposts" />
        </Link>
        <Link href={likesPath}>
          <StateItem count={likesCount} text="Likes" />
        </Link>
      </div>

      {/* Header
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-sm font-bold text-text-primary uppercase tracking-wide">
          Fans
        </span>
        <Info size={13} className="text-text-muted" />
      </div> */}

      {/* Tab (Top only for now)
      <div className="text-xs font-semibold text-text-primary border-b border-border-default pb-1.5 mb-3">
        Top
      </div>

      <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">
        Fans who have played this track the most:
      </p> */}

      {/* {fans.length === 0 ? (
        <p className="text-xs text-text-muted">No fan play stats yet.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {fans.map((fan, idx) => (
            <li key={fan.id} className="flex items-center gap-2">
              <span className="text-xs text-text-muted w-4 text-right shrink-0">
                {idx + 1}
              </span>
              <Link href={`/${fan.slug}`} className="flex items-center gap-2 flex-1 min-w-0 group">
                <Image
                  src={fan.avatarUrl}
                  alt={fan.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 group-hover:opacity-80 transition-opacity"
                  width={28}
                  height={28}
                />
                <span className="text-sm text-text-primary group-hover:text-brand-primary transition-colors truncate">
                  {fan.name}
                </span>
              </Link>
              <span className="text-xs text-text-muted shrink-0">
                {fan.plays.toLocaleString()} plays
              </span>
            </li>
          ))}
        </ol>
      )} */}
    </div>
  );
}