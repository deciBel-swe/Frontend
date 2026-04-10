'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Play, Repeat2 } from 'lucide-react';

type TrackCardStatsProps = {
  userSlug: string;
  trackId: number;
  likeCount: number;
  repostCount: number;
  plays?: number;
  comments?: number;
};

export default function TrackCardStats({
  userSlug,
  trackId,
  likeCount,
  repostCount,
  plays,
  comments,
}: TrackCardStatsProps) {
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

      {comments ? (
        <Link
          href={`/${userSlug}/${trackId}/comments`}
          className="flex items-center gap-1 hover:underline"
        >
          <MessageCircle size={14} />
          <span>{comments}</span>
        </Link>
      ) : null}
    </div>
  );
}
