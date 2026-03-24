import Link from 'next/link';
import { Heart } from 'lucide-react';

export type Comment = {
  id: string | number;
  authorName: string;
  authorSlug: string;
  authorAvatar: string;
  body: string;
  timeAgo: string;
  likes?: number;
  timestampInTrack?: string; // e.g. "0:42"
};

type CommentItemProps = {
  comment: Comment;
  onLike?: (id: string | number) => void;
};

export default function CommentItem({ comment, onLike }: CommentItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-default last:border-0">
      {/* Avatar */}
      <Link href={`/${comment.authorSlug}`} className="flex-shrink-0">
        <img
          src={comment.authorAvatar}
          alt={comment.authorName}
          className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition-opacity"
        />
      </Link>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <Link
            href={`/${comment.authorSlug}`}
            className="text-sm font-semibold text-text-primary hover:text-brand-primary transition-colors"
          >
            {comment.authorName}
          </Link>

          {comment.timestampInTrack && (
            <span className="text-xs text-brand-primary font-mono">
              at {comment.timestampInTrack}
            </span>
          )}
        </div>

        <p className="text-sm text-text-secondary mt-0.5 leading-snug break-words">
          {comment.body}
        </p>

        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-text-muted">{comment.timeAgo}</span>

          {onLike && (
            <button
              onClick={() => onLike(comment.id)}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-brand-primary transition-colors"
              aria-label="Like comment"
            >
              <Heart size={11} />
              {comment.likes ? <span>{comment.likes}</span> : null}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}