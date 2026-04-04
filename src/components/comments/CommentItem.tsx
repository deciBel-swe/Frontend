import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import CommentInput from '@/components/comments/CommentInput';

export type CommentReply = {
  id: string | number;
  authorName: string;
  authorSlug: string;
  authorAvatar: string;
  body: string;
  timeAgo: string;
  timestampInTrack: string;
  timestampSeconds: number;
};

export type Comment = {
  id: string | number;
  authorName: string;
  authorSlug: string;
  authorAvatar: string;
  body: string;
  timeAgo: string;
  timestampInTrack: string;
  timestampSeconds: number;
  replies?: CommentReply[];
};

type CommentItemProps = {
  comment: Comment;
  onReply?: (commentId: string | number, text: string) => Promise<void>;
  isReplySubmitting?: boolean;
  isReplyingThisComment?: boolean;
  currentUserAvatar?: string;
};

export default function CommentItem({
  comment,
  onReply,
  isReplySubmitting = false,
  isReplyingThisComment = false,
  currentUserAvatar,
}: CommentItemProps) {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = async (text: string) => {
    if (!onReply) {
      return;
    }

    await onReply(comment.id, text);
    setReplyText('');
    setIsReplyOpen(false);
  };

  return (
    <div className="py-3 border-b border-border-default last:border-0">
      <div className="flex items-start gap-3">
        <Link href={`/${comment.authorSlug}`} className="shrink-0">
          <Image
            src={comment.authorAvatar}
            alt={comment.authorName}
            className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition-opacity"
            width={36}
            height={36}
            unoptimized
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <Link
              href={`/${comment.authorSlug}`}
              className="text-sm font-semibold text-text-primary hover:text-brand-primary transition-colors"
            >
              {comment.authorName}
            </Link>
            <span className="text-xs text-brand-primary font-mono">
              at {comment.timestampInTrack}
            </span>
          </div>

          <p className="text-sm text-text-secondary mt-0.5 leading-snug wrap-break-word">
            {comment.body}
          </p>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-text-muted">{comment.timeAgo}</span>
            {onReply && (
              <button
                onClick={() => setIsReplyOpen((previous) => !previous)}
                className="text-xs text-text-muted hover:text-brand-primary transition-colors"
                aria-label="Reply to comment"
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {isReplyOpen && onReply && (
        <div className="pl-12 mt-2">
          <CommentInput
            avatarUrl={currentUserAvatar}
            value={replyText}
            onChange={setReplyText}
            onSubmit={(text) => {
              void handleReplySubmit(text);
            }}
            disabled={isReplySubmitting && isReplyingThisComment}
            placeholder="Write a timestamped reply..."
          />
        </div>
      )}

      {(comment.replies?.length ?? 0) > 0 && (
        <div className="pl-12 mt-2 flex flex-col gap-3">
          {comment.replies?.map((reply) => (
            <div key={reply.id} className="flex items-start gap-3">
              <Link href={`/${reply.authorSlug}`} className="shrink-0">
                <Image
                  src={reply.authorAvatar}
                  alt={reply.authorName}
                  className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition-opacity"
                  width={32}
                  height={32}
                  unoptimized
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <Link
                    href={`/${reply.authorSlug}`}
                    className="text-sm font-semibold text-text-primary hover:text-brand-primary transition-colors"
                  >
                    {reply.authorName}
                  </Link>
                  <span className="text-xs text-brand-primary font-mono">
                    at {reply.timestampInTrack}
                  </span>
                </div>

                <p className="text-sm text-text-secondary mt-0.5 leading-snug wrap-break-word">
                  {reply.body}
                </p>

                <span className="text-xs text-text-muted mt-1 inline-block">
                  {reply.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}