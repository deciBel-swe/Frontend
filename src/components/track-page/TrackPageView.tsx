'use client';

import { useTrackPage } from '@/hooks/useTrackPage';
import CommentInput from '@/components/comments/CommentInput';
import CommentList from '@/components/comments/CommentList';
import TrackFansPanel from '@/components/track-page/TrackFansPanel';

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
    fans,
    commentText,
    pendingTimestamp,
    activeTimestampLabel,
    isLoading,
    isError,
    errorMessage,
    isCommentSubmitting,
    replyingToCommentId,
    likeCount,
    repostCount,
    currentUserAvatar: resolvedCurrentUserAvatar,
    setCommentText,
    clearPendingTimestamp,
    onCommentSubmit,
    onReplySubmit,
  } = useTrackPage({ username, trackId, currentUserAvatar });

  if (isLoading) {
    return <div className="w-full mt-4 text-sm text-text-muted">Loading track...</div>;
  }

  if (isError) {
    return (
      <div className="w-full mt-4 text-sm text-text-muted">
        {errorMessage ?? 'Failed to load this track.'}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-0 mt-4">
      {/* 2. BOTTOM SECTION: Grid for Comments + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Left Side: Comments Area */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
           {/* Track description */}
          {track?.description && track.description.trim().length > 0 && (
            <p className="text-sm text-text-primary whitespace-pre-wrap">
              {track.description}
            </p>
          )}
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
          <TrackFansPanel
            fans={fans}
            username={username}
            trackId={trackId}
            likesCount={likeCount}
            repostsCount={repostCount}
            commentsCount={comments.length}
          />
        </aside>
      </div>
    </div>
  );
}