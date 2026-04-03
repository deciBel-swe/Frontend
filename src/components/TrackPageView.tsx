'use client';

import { useTrackPage } from '@/hooks/useTrackPage';
import TrackHero from '@/components/TrackHero';
import TrackActionBar from '@/components/TrackActionBar';
import CommentInput from '@/components/comments/CommentInput';
import CommentList from '@/components/comments/CommentList';
import TrackFansPanel from '@/components/TrackFansPanel';

type TrackPageViewProps = {
  username: string;
  trackId: string;
  currentUserAvatar?: string;
};

export default function TrackPageView({
  username,
  trackId,
  currentUserAvatar,
}: TrackPageViewProps) {
  const {
    track,
    comments,
    waveformComments,
    fans,
    commentText,
    pendingTimestamp,
    activeTimestampLabel,
    isLoading,
    isError,
    errorMessage,
    isCommentSubmitting,
    replyingToCommentId,
    isPlaying,
    waveformCurrentTime,
    waveformDurationSeconds,
    likeCount,
    repostCount,
    isLiked,
    isReposted,
    currentUserAvatar: resolvedCurrentUserAvatar,
    setCommentText,
    clearPendingTimestamp,
    onPlayPause,
    onWaveformSeek,
    onLike,
    onRepost,
    onCommentSubmit,
    onReplySubmit,
  } = useTrackPage({ username, trackId, currentUserAvatar });

  if (isLoading) {
    return <div className="w-full mt-4 text-sm text-text-muted">Loading track...</div>;
  }

  if (isError || !track) {
    return (
      <div className="w-full mt-4 text-sm text-text-muted">
        {errorMessage ?? 'Failed to load this track.'}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-0 mt-4">
      {/* 1. TOP SECTION: Full Width Hero & Action Bar */}
      <div className="w-full">
        <TrackHero
          title={track.title}
          artistName={track.artistName}
          artistSlug={track.artistSlug}
          coverUrl={track.coverUrl}
          timeAgo={track.timeAgo}
          tags={track.tags}
          waveformUrl={track.waveformUrl}
          duration={track.duration}
          currentUserAvatar={resolvedCurrentUserAvatar}
          waveformComments={waveformComments}
          waveformCurrentTime={waveformCurrentTime}
          waveformDurationSeconds={waveformDurationSeconds}
          pendingTimestamp={pendingTimestamp}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onWaveformSeek={onWaveformSeek}
        />

        <TrackActionBar
          plays={track.plays}
          likes={likeCount}
          reposts={repostCount}
          isLiked={isLiked}
          isReposted={isReposted}
          onLike={() => {
            void onLike();
          }}
          onRepost={() => {
            void onRepost();
          }}
        />
      </div>

      {/* 2. BOTTOM SECTION: Grid for Comments + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Left Side: Comments Area */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="font-mono">Comment timestamp: {activeTimestampLabel}</span>
            {pendingTimestamp !== null && (
              <button
                className="hover:text-brand-primary transition-colors"
                onClick={clearPendingTimestamp}
              >
                Clear selected time
              </button>
            )}
          </div>

          <CommentInput
            avatarUrl={resolvedCurrentUserAvatar}
            value={commentText}
            onChange={setCommentText}
            onSubmit={(text) => {
              void onCommentSubmit(text);
            }}
            disabled={isCommentSubmitting}
            placeholder="Write a timestamped comment..."
          />
          <CommentList
            comments={comments}
            onReplyComment={onReplySubmit}
            currentUserAvatar={resolvedCurrentUserAvatar}
            isReplySubmitting={isCommentSubmitting}
            replyingToCommentId={replyingToCommentId}
            isLoading={isLoading}
          />
        </div>

        {/* Right Side: Sidebar (Fans, etc.) */}
        <aside className="w-full lg:w-75 shrink-0">
          <TrackFansPanel fans={fans} />
        </aside>
      </div>
    </div>
  );
}