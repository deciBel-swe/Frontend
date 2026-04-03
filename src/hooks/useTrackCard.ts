'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { commentService, trackService } from '@/services';
import type { Comment as ApiComment } from '@/types/comments';
import type { TimedComment } from '@/components/WaveformTimedComments';

type TopLevelApiComment = ApiComment & { timestampSeconds: number };

type UseTrackCardParams = {
  trackId: number;
  initialIsLiked?: boolean;
  initialIsReposted?: boolean;
  initialLikeCount?: number;
  initialRepostCount?: number;
};

type UseTrackCardResult = {
  timedComments: TimedComment[];
  pendingText: string;
  pendingTimestamp: number | null;
  showCommentInput: boolean;
  waveformTimedCommentsVisible: boolean;
  likeCount: number;
  repostCount: number;
  isLiked: boolean;
  isReposted: boolean;
  isLikePending: boolean;
  isRepostPending: boolean;
  isCommentSubmitting: boolean;
  setPendingText: (value: string) => void;
  selectTimestamp: (timestampSeconds: number) => void;
  onCommentInputFocus: () => void;
  clearPendingCommentSelection: () => void;
  submitTimedComment: (text: string) => Promise<void>;
  onLike: () => Promise<void>;
  onRepost: () => Promise<void>;
};

const isTopLevelTrackComment = (comment: ApiComment): comment is TopLevelApiComment => {
  return typeof comment.timestampSeconds === 'number';
};

const mapCommentToTimed = (comment: { id: string | number; timestampSeconds: number; body: string; user: { username: string; avatarUrl: string } }): TimedComment => ({
  id: String(comment.id),
  timestamp: comment.timestampSeconds,
  comment: comment.body,
  user: {
    name: comment.user.username,
    avatar: comment.user.avatarUrl,
  },
});

const sortTimedComments = (comments: TimedComment[]): TimedComment[] => {
  return [...comments].sort((a, b) => {
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }

    return Number(a.id) - Number(b.id);
  });
};

export function useTrackCard({
  trackId,
  initialIsLiked = false,
  initialIsReposted = false,
  initialLikeCount = 0,
  initialRepostCount = 0,
}: UseTrackCardParams): UseTrackCardResult {
  const [timedComments, setTimedComments] = useState<TimedComment[]>([]);
  const [pendingText, setPendingText] = useState('');
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [waveformTimedCommentsVisible, setWaveformTimedCommentsVisible] = useState(false);

  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [repostCount, setRepostCount] = useState(initialRepostCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isReposted, setIsReposted] = useState(initialIsReposted);

  const [isLikePending, setIsLikePending] = useState(false);
  const [isRepostPending, setIsRepostPending] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  const numericTrackId = useMemo(() => Number(trackId), [trackId]);

  useEffect(() => {
    let isCancelled = false;

    const loadEngagement = async () => {
      if (!Number.isInteger(numericTrackId) || numericTrackId <= 0) {
        return;
      }

      try {
        const [trackMetadata, commentsResponse] = await Promise.all([
          trackService.getTrackMetadata(numericTrackId),
          commentService.getTrackComments(numericTrackId, { page: 0, size: 100 }),
        ]);

        if (isCancelled) {
          return;
        }

        const topLevelComments = (commentsResponse.content ?? []).filter(
          isTopLevelTrackComment
        );

        setTimedComments(
          sortTimedComments(topLevelComments.map(mapCommentToTimed))
        );

        setLikeCount(trackMetadata.likeCount ?? 0);
        setRepostCount(trackMetadata.repostCount ?? 0);
        setIsLiked(trackMetadata.isLiked ?? false);
        setIsReposted(trackMetadata.isReposted ?? false);
      } catch {
        if (!isCancelled) {
          setTimedComments([]);
          setLikeCount(0);
          setRepostCount(0);
          setIsLiked(false);
          setIsReposted(false);
        }
      }
    };

    void loadEngagement();

    return () => {
      isCancelled = true;
    };
  }, [numericTrackId]);

  useEffect(() => {
    setIsLiked(initialIsLiked);
    setIsReposted(initialIsReposted);
    setLikeCount(initialLikeCount);
    setRepostCount(initialRepostCount);
  }, [initialIsLiked, initialIsReposted, initialLikeCount, initialRepostCount]);

  const clearPendingCommentSelection = useCallback(() => {
    setPendingTimestamp(null);
    setPendingText('');
    setShowCommentInput(false);
    setWaveformTimedCommentsVisible(false);
  }, []);

  const selectTimestamp = useCallback((timestampSeconds: number) => {
    setPendingTimestamp(timestampSeconds);
    setShowCommentInput(true);
  }, []);

  const onCommentInputFocus = useCallback(() => {
    if (pendingTimestamp !== null) {
      setWaveformTimedCommentsVisible(true);
    }
  }, [pendingTimestamp]);

  const submitTimedComment = useCallback(
    async (text: string) => {
      if (!Number.isInteger(numericTrackId) || numericTrackId <= 0) {
        return;
      }

      if (isCommentSubmitting || pendingTimestamp === null) {
        return;
      }

      const body = text.trim();
      if (!body) {
        return;
      }

      setIsCommentSubmitting(true);

      try {
        const resolvedTimestamp = Math.max(0, Math.round(pendingTimestamp));
        const created = await commentService.addTrackComment(numericTrackId, {
          body,
          timestampSeconds: resolvedTimestamp,
        });

        const createdTimestamp =
          typeof created.timestampSeconds === 'number'
            ? created.timestampSeconds
            : resolvedTimestamp;

        setTimedComments((previous) =>
          sortTimedComments([
            ...previous,
            {
              id: String(created.id),
              timestamp: createdTimestamp,
              comment: created.body,
              user: {
                name: created.user.username,
                avatar: created.user.avatarUrl,
              },
            },
          ])
        );

        clearPendingCommentSelection();
      } finally {
        setIsCommentSubmitting(false);
      }
    },
    [clearPendingCommentSelection, isCommentSubmitting, numericTrackId, pendingTimestamp]
  );

  const onLike = useCallback(async () => {
    if (!Number.isInteger(numericTrackId) || numericTrackId <= 0 || isLikePending) {
      return;
    }

    const previous = isLiked;
    const next = !previous;
    const delta = next ? 1 : -1;

    setIsLikePending(true);
    setIsLiked(next);
    setLikeCount((count) => Math.max(0, count + delta));

    try {
      const response = next
        ? await trackService.likeTrack(numericTrackId)
        : await trackService.unlikeTrack(numericTrackId);
      setIsLiked(response.isLiked);
    } catch {
      setIsLiked(previous);
      setLikeCount((count) => Math.max(0, count - delta));
    } finally {
      setIsLikePending(false);
    }
  }, [isLikePending, isLiked, numericTrackId]);

  const onRepost = useCallback(async () => {
    if (!Number.isInteger(numericTrackId) || numericTrackId <= 0 || isRepostPending) {
      return;
    }

    const previous = isReposted;
    const next = !previous;
    const delta = next ? 1 : -1;

    setIsRepostPending(true);
    setIsReposted(next);
    setRepostCount((count) => Math.max(0, count + delta));

    try {
      const response = next
        ? await trackService.repostTrack(numericTrackId)
        : await trackService.unrepostTrack(numericTrackId);
      setIsReposted(response.isReposted);
    } catch {
      setIsReposted(previous);
      setRepostCount((count) => Math.max(0, count - delta));
    } finally {
      setIsRepostPending(false);
    }
  }, [isRepostPending, isReposted, numericTrackId]);

  return {
    timedComments,
    pendingText,
    pendingTimestamp,
    showCommentInput,
    waveformTimedCommentsVisible,
    likeCount,
    repostCount,
    isLiked,
    isReposted,
    isLikePending,
    isRepostPending,
    isCommentSubmitting,
    setPendingText,
    selectTimestamp,
    onCommentInputFocus,
    clearPendingCommentSelection,
    submitTimedComment,
    onLike,
    onRepost,
  };
}
