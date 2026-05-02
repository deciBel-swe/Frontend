'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Play, Repeat2 } from 'lucide-react';

type TrackCardStatsProps = {
  userSlug: string;
  routeTrackId: string;
  likeCount: number;
  repostCount: number;
  plays?: number;
  comments?: number;
  commentsHref?: string;
};

export default function TrackCardStats({
  userSlug,
  routeTrackId,
  likeCount,
  repostCount,
  plays,
  comments,
  commentsHref,
}: TrackCardStatsProps) {
  const resolvedCommentsHref =
    commentsHref ?? `/${userSlug}/${routeTrackId}`;

  return (
    <div className="ml-auto flex items-center gap-4 text-xs font-semibold text-text-muted">
      <div className="flex items-center gap-1">
        <Heart size={14} />
        <span>{likeCount}</span>
      </div>

      <div className="flex items-center gap-1">
        <Repeat2 size={14} />
        <span>{repostCount}</span>
      </div>

      {plays ? (
        <div className="flex items-center gap-1">
          <Play size={14} />
          <span>{plays}</span>
        </div>
      ) : null}

      {typeof comments === 'number' && comments > 0 ? (
        <Link
          href={resolvedCommentsHref}
          className="flex items-center gap-1 hover:underline"
        >
          <MessageCircle size={14} />
          <span>{comments}</span>
        </Link>
      ) : null}
    </div>
  );
}
