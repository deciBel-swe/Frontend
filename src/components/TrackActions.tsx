// TrackActions.tsx
'use client';
import React from 'react';
import { Heart, Repeat2, Share2, Copy, MoreHorizontal, Pencil } from 'lucide-react';
import Button from '@/components/buttons/Button';

type TrackActionsProps = {
  size?: number;
  className?: string;
  variant?: 'ghost' | 'secondary' | 'primary'| 'premium';
  isLiked?: boolean;
  isReposted?: boolean;
  
  // Show/hide buttons
  showLike?: boolean;
  showRepost?: boolean;
  showShare?: boolean;
  showCopy?: boolean;
  showEdit?: boolean;
  showMore?: boolean;

  // Callback actions
  onLike?: () => void;
  onRepost?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onEdit?: () => void;
  onMore?: () => void;
};

export default function TrackActions({
  size = 16,
  className = '',
  variant = 'ghost',
  isLiked = false,
  isReposted = false,
  showLike = true,
  showRepost = true,
  showShare = true,
  showCopy = true,
  showEdit = false,
  showMore = true,
  onLike,
  onRepost,
  onShare,
  onCopy,
  onEdit,
  onMore,
}: TrackActionsProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {showLike && (
        <Button
          variant={isLiked? 'ghost_highlight' : variant}
          aria-label="Like"
          aria-pressed={isLiked}
          onClick={onLike}
          className={isLiked ? 'text-brand-primary bg-brand-primary/10' : ''}
        >
          <Heart size={size} fill={isLiked ? 'currentColor' : 'none'} />
        </Button>
      )}
      {showRepost && (
        <Button
          variant={isReposted ? 'ghost_highlight' : variant}
          aria-label="Repost"
          aria-pressed={isReposted}
          onClick={onRepost}
          className={isReposted ? 'text-brand-primary bg-brand-primary/10' : ''}
        >
          <Repeat2 size={size} />
        </Button>
      )}
      {showShare && (
        <Button variant={variant} aria-label="Share" onClick={onShare}>
          <Share2 size={size} />
        </Button>
      )}
      {showCopy && (
        <Button variant={variant} aria-label="Copy link" onClick={onCopy}>
          <Copy size={size} />
        </Button>
      )}
      {showEdit && onEdit && (
        <Button variant={variant} aria-label="Edit" onClick={onEdit}>
        <Pencil size={size} />
        </Button>
      )}
      {showMore && (
        <Button variant={variant} aria-label="More" onClick={onMore}>
          <MoreHorizontal size={size} />
        </Button>
      )}
    </div>
  );
}