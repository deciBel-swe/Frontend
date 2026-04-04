// TrackActions.tsx
'use client';
import React from 'react';
import { Heart, Repeat2, Share2, Copy, Pencil, Trash2, ListPlus } from 'lucide-react';
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
  showAddToQueue?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showMore?: boolean;

  // Callback actions
  onLike?: () => void;
  onRepost?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onAddToQueue?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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
  showAddToQueue = false,
  showEdit = false,
  showDelete = false,
  onLike,
  onRepost,
  onShare,
  onCopy,
  onAddToQueue,
  onEdit,
  onDelete,
}: TrackActionsProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {showLike && (
        <Button
          variant={isLiked ? 'ghost_highlight' : 'ghost'}
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
          variant={isReposted ? 'ghost_highlight' : 'ghost'}
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
      {showAddToQueue && (
        <Button
          variant={variant}
          aria-label="Add to queue"
          onClick={onAddToQueue}
          disabled={!onAddToQueue}
        >
          <ListPlus size={size} />
        </Button>
      )}
      {showEdit && onEdit && (
        <Button variant={variant} aria-label="Edit" onClick={onEdit}>
        <Pencil size={size} />
        </Button>
      )}
      {showDelete && onDelete && (
        <Button
          variant={variant}
          aria-label="Delete"
          onClick={onDelete}
          className="text-status-error hover:text-status-error"
        >
          <Trash2 size={size} />
        </Button>
      )}
    </div>
  );
}