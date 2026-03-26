// TrackActions.tsx
'use client';
import React from 'react';
import { Heart, Repeat2, Share2, Copy, MoreHorizontal, Pencil } from 'lucide-react';
import Button from '@/components/buttons/Button';

type TrackActionsProps = {
  size?: number;
  className?: string;

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
        <Button variant="ghost" aria-label="Like" onClick={onLike}>
          <Heart size={size} />
        </Button>
      )}
      {showRepost && (
        <Button variant="ghost" aria-label="Repost" onClick={onRepost}>
          <Repeat2 size={size} />
        </Button>
      )}
      {showShare && (
        <Button variant="ghost" aria-label="Share" onClick={onShare}>
          <Share2 size={size} />
        </Button>
      )}
      {showCopy && (
        <Button variant="ghost" aria-label="Copy link" onClick={onCopy}>
          <Copy size={size} />
        </Button>
      )}
      {showEdit && onEdit && (
        <Button variant="ghost" aria-label="Edit" onClick={onEdit}>
        <Pencil size={size} />
        </Button>
      )}
      {showMore && (
        <Button variant="ghost" aria-label="More" onClick={onMore}>
          <MoreHorizontal size={size} />
        </Button>
      )}
    </div>
  );
}