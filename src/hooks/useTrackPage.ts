'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth';
import type { PlaybackAccess, PlayerTrack } from '@/features/player/contracts/playerContracts';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { commentService, trackService } from '@/services';
import type { Comment as ApiComment, ReplyComment as ApiReplyComment } from '@/types/comments';
import type { Comment as ViewComment, CommentReply as ViewCommentReply } from '@/components/comments/CommentItem';
import type { TimedComment } from '@/components/WaveformTimedComments';
import type { Fan } from '@/components/TrackFansPanel';

type TopLevelApiComment = ApiComment & { timestampSeconds: number };

export type TrackPageData = {
  id: number;
  title: string;
  artistName: string;
  artistSlug: string;
  coverUrl: string;
  timeAgo: string;
  tags: string[];
  waveformUrl: string;
  duration: string;
  plays: number;
  description: string;
};

type UseTrackPageParams = {
  username: string;
  trackId: string | number;
  currentUserAvatar?: string;
};

type UseTrackPageResult = {
  track: TrackPageData | null;
  comments: ViewComment[];
  waveformComments: TimedComment[];
  fans: Fan[];
  commentText: string;
  pendingTimestamp: number | null;
  activeTimestampLabel: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isCommentSubmitting: boolean;
  replyingToCommentId: string | number | null;
  isPlaying: boolean;
  waveformCurrentTime: number;
  waveformDurationSeconds: number;
  likeCount: number;
  repostCount: number;
  isLiked: boolean;
  isReposted: boolean;
  currentUserAvatar?: string;
  setCommentText: (value: string) => void;
  clearPendingTimestamp: () => void;
  onPlayPause: () => void;
  onWaveformSeek: (percent: number) => void;
  onLike: () => Promise<void>;
  onRepost: () => Promise<void>;
  onCommentSubmit: (text: string) => Promise<void>;
  onReplySubmit: (commentId: string | number, text: string) => Promise<void>;
};

const toPlaybackAccess = (
  access: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined
): PlaybackAccess => {
  if (access === 'BLOCKED' || access === 'PREVIEW') {
    return 'BLOCKED';
  }

  return 'PLAYABLE';
};

const formatDuration = (durationSeconds: number | undefined): string => {
  if (!durationSeconds || durationSeconds <= 0) {
    return '0:00';
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const formatTimeAgo = (value: string | null | undefined): string => {
  if (!value) {
    return 'just now';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'just now';
  }

  const now = Date.now();
  const diffMs = now - parsed.getTime();
  if (diffMs <= 0) {
    return 'just now';
  }

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
};

const formatTrackTimestamp = (timestampSeconds: number): string => {
  const normalized = Math.max(0, Math.floor(timestampSeconds));
  const minutes = Math.floor(normalized / 60);
  const seconds = normalized % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const isTopLevelTrackComment = (comment: ApiComment): comment is TopLevelApiComment => {
  return typeof comment.timestampSeconds === 'number';
};

const mapApiCommentToView = (comment: TopLevelApiComment): ViewComment => {
  return {
    id: comment.id,
    authorName: comment.user.username,
    authorSlug: comment.user.username,
    authorAvatar: comment.user.avatarUrl,
    body: comment.body,
    timeAgo: formatTimeAgo(comment.createdAt),
    timestampInTrack: formatTrackTimestamp(comment.timestampSeconds),
    timestampSeconds: comment.timestampSeconds,
    replies: [],
  };
};

const mapApiReplyToView = (reply: ApiReplyComment): ViewCommentReply => {
  const timestampSeconds = reply.timestampSeconds ?? 0;

  return {
    id: reply.id,
    authorName: reply.user.username,
    authorSlug: reply.user.username,
    authorAvatar: reply.user.avatarUrl,
    body: reply.body,
    timeAgo: formatTimeAgo(reply.createdAt),
    timestampInTrack: formatTrackTimestamp(timestampSeconds),
    timestampSeconds,
  };
};

const mapApiCommentToWaveform = (comment: ApiComment): TimedComment => {
  return {
    id: String(comment.id),
    timestamp: comment.timestampSeconds ?? 0,
    comment: comment.body,
    user: {
      name: comment.user.username,
      avatar: comment.user.avatarUrl,
    },
  };
};

export function useTrackPage({
  username,
  trackId,
  currentUserAvatar: explicitCurrentUserAvatar,
}: UseTrackPageParams): UseTrackPageResult {
  const { user } = useAuth();

  const [track, setTrack] = useState<TrackPageData | null>(null);
  const [comments, setComments] = useState<ViewComment[]>([]);
  const [waveformComments, setWaveformComments] = useState<TimedComment[]>([]);
  const [fans, setFans] = useState<Fan[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [commentText, setCommentText] = useState('');
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | number | null>(null);
  const [playerTrack, setPlayerTrack] = useState<PlayerTrack | null>(null);
  const [knownDurationSeconds, setKnownDurationSeconds] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [repostCount, setRepostCount] = useState(0);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isRepostPending, setIsRepostPending] = useState(false);

  const playTrackFromStore = usePlayerStore((state) => state.playTrack);
  const pauseTrackFromStore = usePlayerStore((state) => state.pause);
  const seekFromStore = usePlayerStore((state) => state.seek);
  const currentPlayerTrackId = usePlayerStore(
    (state) => state.currentTrack?.id ?? null
  );
  const playerIsPlaying = usePlayerStore((state) => state.isPlaying);
  const playerCurrentTime = usePlayerStore((state) => state.currentTime);
  const playerDuration = usePlayerStore((state) => state.duration);

  const parsedTrackId = useMemo(() => Number(trackId), [trackId]);

  const currentUserAvatar = explicitCurrentUserAvatar ?? user?.avatarUrl;

  useEffect(() => {
    let isCancelled = false;

    const loadTrackPage = async () => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      try {
        if (!Number.isInteger(parsedTrackId) || parsedTrackId <= 0) {
          throw new Error('Invalid track id');
        }

        const [trackMetadata, commentsResponse] =
          await Promise.all([
            trackService.getTrackMetadata(parsedTrackId),
            commentService.getTrackComments(parsedTrackId, { page: 0, size: 100 }),
          ]);

        if (isCancelled) {
          return;
        }

        const waveformData = trackMetadata.waveformData ?? [];
        const trackCreatedAt =
          trackMetadata.releaseDate && trackMetadata.releaseDate.trim().length > 0
            ? trackMetadata.releaseDate
            : null;
        const artistUsername = trackMetadata.artist.username ?? username;

        const resolvedTrack: TrackPageData = {
          id: trackMetadata.id,
          title: trackMetadata.title,
          artistName: artistUsername,
          artistSlug: artistUsername,
          coverUrl: trackMetadata.coverUrl,
          timeAgo: formatTimeAgo(trackCreatedAt),
          tags: trackMetadata.tags,
          waveformUrl: JSON.stringify(waveformData),
          duration: formatDuration(trackMetadata.durationSeconds),
          plays: trackMetadata.playCount ?? 0,
          description: trackMetadata.description ?? '',
        };

        const resolvedPlayerTrack = playerTrackMappers.fromTrackMetaData(
          trackMetadata,
          {
            access: toPlaybackAccess(trackMetadata.access),
          }
        );

        const topLevelComments = (commentsResponse.content ?? []).filter(
          isTopLevelTrackComment
        );
        const repliesByParentId = await Promise.all(
          topLevelComments.map(async (comment) => {
            const repliesResponse = await commentService.getCommentReplies(comment.id, {
              page: 0,
              size: 100,
            });

            return {
              commentId: comment.id,
              replies: (repliesResponse.content ?? []).map(mapApiReplyToView),
            };
          })
        );

        const repliesByParent = new Map<number, ReturnType<typeof mapApiReplyToView>[]>();
        for (const entry of repliesByParentId) {
          repliesByParent.set(entry.commentId, entry.replies);
        }

        const mappedComments = topLevelComments.map((comment) => {
          const mapped = mapApiCommentToView(comment);
          return {
            ...mapped,
            replies: repliesByParent.get(comment.id) ?? [],
          };
        });

        const flattenedTimedComments: TimedComment[] = [
          ...topLevelComments.map(mapApiCommentToWaveform),
          ...repliesByParentId.flatMap((entry) =>
            entry.replies.map((reply) => ({
              id: String(reply.id),
              timestamp: reply.timestampSeconds,
              comment: reply.body,
              user: {
                name: reply.authorName,
                avatar: reply.authorAvatar,
              },
            }))
          ),
        ];

        const resolvedLikeCount = trackMetadata.likeCount ?? 0;
        const resolvedRepostCount = trackMetadata.repostCount ?? 0;
        const resolvedIsLiked = trackMetadata.isLiked ?? false;
        const resolvedIsReposted = trackMetadata.isReposted ?? false;

        setTrack(resolvedTrack);
        setPlayerTrack(resolvedPlayerTrack);
        setKnownDurationSeconds(trackMetadata.durationSeconds ?? 0);
        setComments(mappedComments);
        setWaveformComments(flattenedTimedComments);
        setFans([]);
        setLikeCount(resolvedLikeCount);
        setRepostCount(resolvedRepostCount);
        setIsLiked(resolvedIsLiked);
        setIsReposted(resolvedIsReposted);
      } catch (error) {
        if (!isCancelled) {
          setIsError(true);
          setErrorMessage(
            error instanceof Error ? error.message : 'Failed to load track page'
          );
          setTrack(null);
          setPlayerTrack(null);
          setKnownDurationSeconds(0);
          setComments([]);
          setWaveformComments([]);
          setFans([]);
          setPendingTimestamp(null);
          setLikeCount(0);
          setRepostCount(0);
          setIsLiked(false);
          setIsReposted(false);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadTrackPage();

    return () => {
      isCancelled = true;
    };
  }, [parsedTrackId, user, username]);

  const isPlaying =
    playerTrack?.id !== undefined &&
    currentPlayerTrackId === playerTrack.id &&
    playerIsPlaying;

  const isCurrentPlaybackTrack =
    playerTrack?.id !== undefined && currentPlayerTrackId === playerTrack.id;

  useEffect(() => {
    if (isCurrentPlaybackTrack && playerDuration > 0) {
      setKnownDurationSeconds((previous) =>
        Math.abs(previous - playerDuration) > 0.01 ? playerDuration : previous
      );
    }
  }, [isCurrentPlaybackTrack, playerDuration]);

  const waveformDurationSeconds =
    knownDurationSeconds > 0
      ? knownDurationSeconds
      : playerTrack?.durationSeconds ?? 1;

  const waveformCurrentTime = isCurrentPlaybackTrack ? playerCurrentTime : 0;
  const activeTimestampSeconds =
    pendingTimestamp ?? (isCurrentPlaybackTrack ? playerCurrentTime : 0);
  const activeTimestampLabel = formatTrackTimestamp(activeTimestampSeconds);

  const onPlayPause = useCallback(() => {
    if (!playerTrack) {
      return;
    }

    const isCurrentTrack = currentPlayerTrackId === playerTrack.id;
    if (isCurrentTrack && playerIsPlaying) {
      pauseTrackFromStore();
      return;
    }

    playTrackFromStore(playerTrack);
  }, [
    currentPlayerTrackId,
    pauseTrackFromStore,
    playTrackFromStore,
    playerIsPlaying,
    playerTrack,
  ]);

  const onWaveformSeek = useCallback(
    (percent: number) => {
      if (!playerTrack) {
        return;
      }

      const clampedPercent = Math.max(0, Math.min(1, percent));
      const seekDuration = waveformDurationSeconds;
      if (seekDuration <= 0) {
        return;
      }

      const timestamp = clampedPercent * seekDuration;

      const isCurrentTrack = currentPlayerTrackId === playerTrack.id;
      if (!isCurrentTrack || !playerIsPlaying) {
        playTrackFromStore(playerTrack);
      }

      seekFromStore(timestamp);
      setPendingTimestamp(timestamp);
    },
    [
      currentPlayerTrackId,
      playTrackFromStore,
      playerIsPlaying,
      playerTrack,
      seekFromStore,
      waveformDurationSeconds,
    ]
  );

  const onLike = useCallback(async () => {
    if (!track || isLikePending) {
      return;
    }

    const prevLiked = isLiked;
    const nextLiked = !prevLiked;
    const delta = nextLiked ? 1 : -1;

    setIsLikePending(true);
    setIsLiked(nextLiked);
    setLikeCount((count) => Math.max(0, count + delta));

    try {
      const response = nextLiked
        ? await trackService.likeTrack(track.id)
        : await trackService.unlikeTrack(track.id);
      setIsLiked(response.isLiked);
    } catch {
      setIsLiked(prevLiked);
      setLikeCount((count) => Math.max(0, count - delta));
    } finally {
      setIsLikePending(false);
    }
  }, [isLikePending, isLiked, track]);

  const onRepost = useCallback(async () => {
    if (!track || isRepostPending) {
      return;
    }

    const prevReposted = isReposted;
    const nextReposted = !prevReposted;
    const delta = nextReposted ? 1 : -1;

    setIsRepostPending(true);
    setIsReposted(nextReposted);
    setRepostCount((count) => Math.max(0, count + delta));

    try {
      const response = nextReposted
        ? await trackService.repostTrack(track.id)
        : await trackService.unrepostTrack(track.id);
      setIsReposted(response.isReposted);
    } catch {
      setIsReposted(prevReposted);
      setRepostCount((count) => Math.max(0, count - delta));
    } finally {
      setIsRepostPending(false);
    }
  }, [isRepostPending, isReposted, track]);

  const onCommentSubmit = useCallback(
    async (text: string) => {
      if (!track || isCommentSubmitting) {
        return;
      }

      const body = text.trim();
      if (!body) {
        return;
      }

      setIsCommentSubmitting(true);

      try {
        const resolvedTimestampSeconds = Math.max(
          0,
          Math.round(pendingTimestamp ?? (isCurrentPlaybackTrack ? playerCurrentTime : 0))
        );

        const created = await commentService.addTrackComment(track.id, {
          body,
          timestampSeconds: resolvedTimestampSeconds,
        });

        if (isTopLevelTrackComment(created)) {
          setComments((prev) => [mapApiCommentToView(created), ...prev]);
          setWaveformComments((prev) => [mapApiCommentToWaveform(created), ...prev]);
        }
        setCommentText('');
        setPendingTimestamp(null);
      } finally {
        setIsCommentSubmitting(false);
      }
    },
    [isCommentSubmitting, isCurrentPlaybackTrack, pendingTimestamp, playerCurrentTime, track]
  );

  const onReplySubmit = useCallback(
    async (commentId: string | number, text: string) => {
      if (!track || isCommentSubmitting) {
        return;
      }

      const body = text.trim();
      if (!body) {
        return;
      }

      const numericCommentId = Number(commentId);
      if (!Number.isInteger(numericCommentId) || numericCommentId <= 0) {
        return;
      }

      setIsCommentSubmitting(true);
      setReplyingToCommentId(commentId);

      try {
        const resolvedTimestampSeconds = Math.max(
          0,
          Math.round(pendingTimestamp ?? (isCurrentPlaybackTrack ? playerCurrentTime : 0))
        );

        const created = await commentService.replyToComment(numericCommentId, {
          body,
          timestampSeconds: resolvedTimestampSeconds,
        });

        const replyTimestampSeconds = created.timestampSeconds ?? resolvedTimestampSeconds;

        const mappedReply = {
          id: created.id,
          authorName: created.user.username,
          authorSlug: created.user.username,
          authorAvatar: created.user.avatarUrl,
          body: created.body,
          timeAgo: formatTimeAgo(created.createdAt),
          timestampInTrack: formatTrackTimestamp(replyTimestampSeconds),
          timestampSeconds: replyTimestampSeconds,
        };

        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id !== commentId) {
              return comment;
            }

            return {
              ...comment,
              replies: [...(comment.replies ?? []), mappedReply],
            };
          })
        );

        setWaveformComments((prev) => [
          ...prev,
          {
            id: String(created.id),
            timestamp: replyTimestampSeconds,
            comment: created.body,
            user: {
              name: created.user.username,
              avatar: created.user.avatarUrl,
            },
          },
        ]);

        setPendingTimestamp(null);
      } finally {
        setIsCommentSubmitting(false);
        setReplyingToCommentId(null);
      }
    },
    [isCommentSubmitting, isCurrentPlaybackTrack, pendingTimestamp, playerCurrentTime, track]
  );

  return {
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
    currentUserAvatar,
    setCommentText,
    clearPendingTimestamp: () => {
      setPendingTimestamp(null);
    },
    onPlayPause,
    onWaveformSeek,
    onLike,
    onRepost,
    onCommentSubmit,
    onReplySubmit,
  };
}
