import CommentItem, { type Comment } from '@/components/comments/CommentItem';
import InfiniteScrollPagination from '@/components/pagination/InfiniteScrollPagination';

type CommentListProps = {
  comments: Comment[];
  onReplyComment?: (commentId: string | number, text: string) => Promise<void>;
  onReportComment?: (commentId: string | number) => void;
  currentUserAvatar?: string;
  isReplySubmitting?: boolean;
  replyingToCommentId?: string | number | null;
  isLoading?: boolean;
  isPaginating?: boolean;
  hasMore?: boolean;
  sentinelRef?: (node: HTMLDivElement | null) => void;
};

export default function CommentList({
  comments,
  onReplyComment,
  onReportComment,
  currentUserAvatar,
  isReplySubmitting = false,
  replyingToCommentId = null,
  isLoading = false,
  isPaginating = false,
  hasMore = false,
  sentinelRef,
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 py-3">
            <div className="w-9 h-9 rounded-full bg-interactive-default animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-interactive-default rounded animate-pulse w-32" />
              <div className="h-3 bg-interactive-default rounded animate-pulse w-full" />
              <div className="h-3 bg-interactive-default rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-text-muted py-4">
        No comments yet. Be the first!
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReplyComment}
          onReport={onReportComment}
          currentUserAvatar={currentUserAvatar}
          isReplySubmitting={isReplySubmitting}
          isReplyingThisComment={replyingToCommentId === comment.id}
        />
      ))}
      <InfiniteScrollPagination
        hasMore={hasMore}
        isPaginating={isPaginating}
        sentinelRef={sentinelRef}
        loader={
          <div className="flex flex-col gap-3 pt-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`comment-list-append-${index}`} className="flex items-start gap-3 py-3">
                <div className="w-9 h-9 rounded-full bg-interactive-default animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-interactive-default rounded animate-pulse w-32" />
                  <div className="h-3 bg-interactive-default rounded animate-pulse w-full" />
                  <div className="h-3 bg-interactive-default rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        }
      />
    </div>
  );
}
