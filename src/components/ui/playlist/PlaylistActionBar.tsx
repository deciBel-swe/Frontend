'use client';

import React from 'react';
import TrackActions from '@/components/TrackActions';

type PlaylistActionBarProps = {
  onShare?: () => void;
  onCopyLink?: () => void;
  onEdit?: () => void;
  onMore?: () => void;
  onDelete?: () => void;
  onAddToQueue?: () => void; // <-- Added this
};

export default function PlaylistActionBar({
  onShare,
  onCopyLink,
  onEdit,
  onMore,
  onDelete,
  onAddToQueue, // <-- Added this
}: PlaylistActionBarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      <TrackActions
        showLike={false}
        showRepost={false}
        showShare
        showCopy
        showEdit
        showMore
        showDelete={!!onDelete}
        showAddToQueue={!!onAddToQueue} // <-- Added this
        onShare={onShare}
        onCopy={onCopyLink}
        onEdit={onEdit}
        onMore={onMore}
        onDelete={onDelete}
        onAddToQueue={onAddToQueue} // <-- Added this
      />
    </div>
  );
}
