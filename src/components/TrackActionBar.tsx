'use client';

import { Heart, Repeat2, Share2, List} from 'lucide-react';
import Button from '@/components/buttons/Button';

type TrackActionBarProps = {
  plays: number;
  likes: number;
  reposts: number;
  isLiked?: boolean;
  isReposted?: boolean;
  onLike?: () => void;
  onRepost?: () => void;
  onShare?: () => void;
  onAddToPlaylist?: () => void;
  onMore?: () => void;
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function TrackActionBar({
  plays,
  likes,
  reposts,
  isLiked = false,
  isReposted = false,
  onLike,
  onRepost,
  onShare,
  onAddToPlaylist,
}: TrackActionBarProps) {
  return (
    <div className="flex items-center justify-between border-t border-b border-border-default py-1 px-1">
      {/* Left: action buttons */}
      <div className="flex items-center gap-1">
        {/* Like */}
        <Button
          variant={isLiked ? 'ghost_highlight' : 'ghost'}
          onClick={onLike}
          aria-label="Like"
          className={`flex items-center gap-1.5 text-sm px-2 py-1.5 rounded ${
            isLiked ? 'text-brand-primary' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Heart
            size={16}
            fill={isLiked ? 'currentColor' : 'none'}
            strokeWidth={isLiked ? 0 : 2}
          />
          <span>{formatCount(likes)}</span>
        </Button>

        {/* Repost */}
        <Button
          variant={isReposted ? 'ghost_highlight' : 'ghost'}
          onClick={onRepost}
          aria-label="Repost"
          className={`flex items-center gap-1.5 text-sm px-2 py-1.5 rounded ${
            isReposted ? 'text-brand-primary' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Repeat2 size={16} />
          <span>{formatCount(reposts)}</span>
        </Button>

        {/* Share */}
        <Button
          variant="ghost"
          onClick={onShare}
          aria-label="Share"
          className="flex items-center gap-1.5 text-sm px-2 py-1.5 rounded text-text-muted hover:text-text-primary"
        >
          <Share2 size={15} />
        </Button>

        {/* Add to playlist */}
        <Button
          variant="ghost"
          onClick={onAddToPlaylist}
          aria-label="Add to playlist"
          className="flex items-center gap-1.5 text-sm px-2 py-1.5 rounded text-text-muted hover:text-text-primary"
        >
          <List size={15} />
          <span className="hidden sm:inline">Add to playlist</span>
        </Button>

        {/* More
        <Button
          variant="ghost"
          onClick={onMore}
          aria-label="More options"
          className="text-text-muted hover:text-text-primary px-2 py-1.5 rounded"
        >
          <MoreHorizontal size={16} />
        </Button> */}
      </div>

      {/* Right: play count */}
      <div className="flex items-center gap-1.5 text-sm text-text-muted pr-1">
        {/* Play icon (triangle) */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2 1.5l8 4.5-8 4.5z" />
        </svg>
        <span>{formatCount(plays)}</span>
      </div>
    </div>
  );
}