'use client';

import TrackActions from '@/components/tracks/actions/TrackActions';
import TrackCardStats from './TrackCardStats';

type TrackCardFooterProps = {
  userSlug: string;
  trackId: number;
  routeTrackId?: string;
  showEditButton: boolean;
  isLiked: boolean;
  isReposted: boolean;
  likeCount: number;
  repostCount: number;
  plays?: number;
  comments?: number;
  commentsHref?: string;
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
  onAddToPlaylist?: () => void;
  onStation?: () => void;
  onReport?: () => void;
  showReport?: boolean;
};

export default function TrackCardFooter({
  userSlug,
  trackId,
  routeTrackId,
  showEditButton,
  isLiked,
  isReposted,
  likeCount,
  repostCount,
  plays,
  comments,
  commentsHref,
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
  onReport,
  showReport = false,
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
        showReport={showReport}
        onReport={onReport}
      />

      <TrackCardStats
        userSlug={userSlug}
        routeTrackId={routeTrackId ?? String(trackId)}
        likeCount={likeCount}
        repostCount={repostCount}
        plays={plays}
        comments={comments}
        commentsHref={commentsHref}
      />
    </div>
  );
}
