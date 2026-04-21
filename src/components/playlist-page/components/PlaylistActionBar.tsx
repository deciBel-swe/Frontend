'use client';

import React from 'react';
import TrackActions from '@/components/tracks/actions/TrackActions';
import Button from '@/components/buttons/Button';
import { Pause, Play } from 'lucide-react';

type PlaylistActionBarProps = {
  onShare?: () => void;
  onCopyLink?: () => void;
  onEdit?: () => void;
  onAddToQueue?: () => void;
  onLike?: () => void;
  onRepost?: () => void;
  onDelete?: () => void;
  onPlayPause?: () => void;
  isLiked?: boolean;
  isReposted?: boolean;
  isPlaying?: boolean;
};

export default function PlaylistActionBar({
  onShare,
  onCopyLink,
  onEdit,
  onAddToQueue,
  onLike,
  onRepost,
  onDelete,
  onPlayPause,
  isLiked = false,
  isReposted = false,
  isPlaying = false,
}: PlaylistActionBarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {onPlayPause ? (
        <Button
          variant="ghost"
          aria-label={isPlaying ? 'Pause playlist' : 'Play playlist'}
          onClick={onPlayPause}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="translate-x-px" />}
        </Button>
      ) : null}

      <TrackActions
        showLike
        showRepost
        showShare
        showCopy
        showAddToQueue
        showEdit={Boolean(onEdit)}
        showDelete={Boolean(onDelete)}
        isLiked={isLiked}
        isReposted={isReposted}
        onLike={onLike}
        onShare={onShare}
        onCopy={onCopyLink}
        onEdit={onEdit}
        onAddToQueue={onAddToQueue}
        onRepost={onRepost}
        onDelete={onDelete}
      />
    </div>
  );
}