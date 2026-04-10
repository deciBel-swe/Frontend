'use client';

import React from 'react';
import TrackActions from '@/components/tracks/actions/TrackActions';

type PlaylistActionBarProps = {
  onShare?: () => void;
  onCopyLink?: () => void;
  onEdit?: () => void;
  onMore?: () => void;
  onDelete?: () => void;
};

export default function PlaylistActionBar({
  onShare,
  onCopyLink,
  onEdit,
  onMore,
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
        onShare={onShare}
        onCopy={onCopyLink}
        onEdit={onEdit}
        onMore={onMore}
      />
    </div>
  );
}