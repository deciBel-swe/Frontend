'use client';

import TrackActions from '@/components/tracks/actions/TrackActions';
import TrackCardStats from './TrackCardStats';

type TrackCardFooterProps = {
  userSlug: string;
  trackId: number;
  showEditButton: boolean;
  isLiked: boolean;
  isReposted: boolean;
  likeCount: number;
  repostCount: number;
  plays?: number;
  comments?: number;
  canAddToQueue: boolean;
  isMoreOpen: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onLike: () => void;
  onRepost: () => void;
  onShare: () => void;
  onCopy: () => void;
  onAddToQueue: () => void;
  onMoreToggle: () => void;
  onMoreClose: () => void;
  onAddToPlaylist: () => void;
  onStation: () => void;
};

export default function TrackCardFooter({
  userSlug,
  trackId,
  showEditButton,
  isLiked,
  isReposted,
  likeCount,
  repostCount,
  plays,
  comments,
  canAddToQueue,
  isMoreOpen,
  onEdit,
  onDelete,
  onLike,
  onRepost,
  onShare,
  onCopy,
  onAddToQueue,
  onMoreToggle,
  onMoreClose,
  onAddToPlaylist,
  onStation,
}: TrackCardFooterProps) {
  return (
    <div className="flex w-full items-center">
      <TrackActions
        size={16}
        showEdit={showEditButton}
        showDelete={showEditButton}
        showAddToQueue={canAddToQueue}
        isLiked={isLiked}
        isReposted={isReposted}
        onEdit={onEdit}
        onDelete={onDelete}
        onLike={onLike}
        onRepost={onRepost}
        onShare={onShare}
        onCopy={onCopy}
        onAddToQueue={onAddToQueue}
        showMore
        isMoreOpen={isMoreOpen}
        onMoreToggle={onMoreToggle}
        onMoreClose={onMoreClose}
        onAddToPlaylist={onAddToPlaylist}
        onStation={onStation}
      />

      <TrackCardStats
        userSlug={userSlug}
        trackId={trackId}
        likeCount={likeCount}
        repostCount={repostCount}
        plays={plays}
        comments={comments}
      />
    </div>
  );
}
