'use client';

import React from 'react';
import TrackActions from '@/components/tracks/actions/TrackActions';
import { Heart, Repeat } from 'lucide-react';
import Link from 'next/link';

type PlaylistActionBarProps = {
  onShare?: () => void;
  onCopyLink?: () => void;
  onEdit?: () => void;
  onAddToQueue?: () => void;
  onRepost?: () => void;
  onDelete?: () => void;
};

export default function PlaylistActionBar({
  onShare,
  onCopyLink,
  onEdit,
  onAddToQueue,
  onRepost,
  onDelete
}: PlaylistActionBarProps) {
  return (
    // not auth / auth the same
    // not my playlist: love + repost + share + copylink + add to next up
    // my playlist: love + repost + share + copylink + add to next up + edit + delete
    <div className="flex items-center gap-1 px-3 py-2.5">
      {/* show edit + delete only if it's my playlist */}
      {/* donnot repost if my playlist */}
      <TrackActions
        showLike
        showRepost
        showShare
        showCopy
        showAddToQueue
        showEdit
        showDelete
        onShare={onShare}
        onCopy={onCopyLink}
        onEdit={onEdit}
        onAddToQueue={onAddToQueue}
        onRepost={onRepost}
        onDelete={onDelete}
      />
   <div className="ml-auto flex items-center gap-3">
    <Link href="#" className="text-neutral-400 hover:text-interactive-hover transition-colors">
      <Heart size={13} />
    </Link>

    <Link href="#" className="text-neutral-400 hover:text-interactive-hover transition-colors">
      <Repeat size={13} />
    </Link>
  </div>
    </div>
  );
}