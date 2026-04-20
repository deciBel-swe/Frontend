import { useCallback, useEffect, useState } from 'react';

import type { TimedComment } from '@/features/tracks/components/WaveformTimedComments';
import type {
  PlaybackAccess,
  PlayerTrack,
} from '@/features/player/contracts/playerContracts';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { commentService, trackService } from '@/services';
import { formatDuration } from '@/utils/formatDuration';

const toPlaybackAccess = (
  access: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined
): PlaybackAccess | undefined => {
  if (!access) {
    return undefined;
  }

  if (access === 'BLOCKED' || access === 'PREVIEW') {
    return 'BLOCKED';
  }

  return 'PLAYABLE';
};

type UseTrackHeaderItemParams = {
  username: string;
  trackId: string;
};

type TrackHeroHeader = {
  title: string;
  artistName: string;
  artistSlug: string;
  coverUrl: string;
  timeAgo: string;
  tags: string[];
  genre: string;
  waveformUrl: string;
  duration: string;
  plays: number;
};

const formatTimeAgo = (value: string | undefined): string => {
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
  return `${days}d ago`;
};

const toWaveformTimedComment = (
  comment: {
    id: number;
    body: string;
    timestampSeconds?: number | null;
    user: { username: string; avatarUrl: string };
  }
): TimedComment | null => {
  if (typeof comment.timestampSeconds !== 'number' || !Number.isFinite(comment.timestampSeconds)) {
    return null;
  }

  if (comment.timestampSeconds < 0) {
    return null;
  }

  return {
    id: String(comment.id),
    timestamp: comment.timestampSeconds,
    comment: comment.body,
    user: {
      name: comment.user.username,
      avatar: comment.user.avatarUrl,
    },
  };
};

export function useTrackHeaderItem({ username, trackId }: UseTrackHeaderItemParams) {
  const [hero, setHero] = useState<TrackHeroHeader | null>(null);
  const [playerTrack, setPlayerTrack] = useState<PlayerTrack | null>(null);
  const [waveformComments, setWaveformComments] = useState<TimedComment[]>([]);
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [knownDurationSeconds, setKnownDurationSeconds] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [repostCount, setRepostCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isRepostPending, setIsRepostPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const playTrackFromStore = usePlayerStore((state) => state.playTrack);
  const pauseTrackFromStore = usePlayerStore((state) => state.pause);
  const seekFromStore = usePlayerStore((state) => state.seek);
  const currentPlayerTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null);
  const playerIsPlaying = usePlayerStore((state) => state.isPlaying);
  const playerCurrentTime = usePlayerStore((state) => state.currentTime);
  const playerDuration = usePlayerStore((state) => state.duration);

  useEffect(() => {
    let isCancelled = false;

    const loadTrackHeader = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const parsedTrackId = Number(trackId);
        if (!Number.isInteger(parsedTrackId) || parsedTrackId <= 0) {
          if (!isCancelled) {
            setHero(null);
            setPlayerTrack(null);
            setWaveformComments([]);
            setPendingTimestamp(null);
            setKnownDurationSeconds(0);
            setLikeCount(0);
            setRepostCount(0);
            setIsLiked(false);
            setIsReposted(false);
          }
          return;
        }

        const [trackMetadata, commentsResponse] = await Promise.all([
          trackService.getTrackMetadata(parsedTrackId),
          commentService.getTrackComments(parsedTrackId, { page: 0, size: 100 }),
        ]);

        if (isCancelled) {
          return;
        }

        const topLevelComments = commentsResponse.content ?? [];
        const repliesByComment = await Promise.all(
          topLevelComments.map(async (comment) => {
            try {
              const repliesResponse = await commentService.getCommentReplies(comment.id, {
                page: 0,
                size: 100,
              });

              return repliesResponse.content ?? [];
            } catch {
              return [];
            }
          })
        );

        if (isCancelled) {
          return;
        }

        const flattenedWaveformComments = [
          ...topLevelComments,
          ...repliesByComment.flat(),
        ]
          .map(toWaveformTimedComment)
          .filter((comment): comment is TimedComment => comment !== null);

        const artistName = trackMetadata.artist.username ?? username;
        const durationSeconds = trackMetadata.durationSeconds;

        setHero({
          title: trackMetadata.title,
          artistName,
          artistSlug: artistName,
          coverUrl: trackMetadata.coverUrl,
          timeAgo: formatTimeAgo(trackMetadata.releaseDate),
          tags: trackMetadata.tags,
          genre: trackMetadata.genre,
          waveformUrl: JSON.stringify(trackMetadata.waveformData ?? []),
          duration: durationSeconds ? formatDuration(durationSeconds) : '0:00',
          plays: trackMetadata.playCount ?? 0,
        });

        setPlayerTrack(
          playerTrackMappers.fromTrackMetaData(trackMetadata, {
            access: toPlaybackAccess(trackMetadata.access),
          })
        );
        setWaveformComments(flattenedWaveformComments);
        setPendingTimestamp(null);
        setKnownDurationSeconds(durationSeconds ?? 0);
        setLikeCount(trackMetadata.likeCount ?? 0);
        setRepostCount(trackMetadata.repostCount ?? 0);
        setIsLiked(trackMetadata.isLiked ?? false);
        setIsReposted(trackMetadata.isReposted ?? false);
      } catch {
        if (!isCancelled) {
          setHero(null);
          setPlayerTrack(null);
          setWaveformComments([]);
          setPendingTimestamp(null);
          setKnownDurationSeconds(0);
          setLikeCount(0);
          setRepostCount(0);
          setIsLiked(false);
          setIsReposted(false);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadTrackHeader();

    return () => {
      isCancelled = true;
    };
  }, [trackId, username]);

  const isCurrentPlaybackTrack =
    playerTrack?.id !== undefined && currentPlayerTrackId === playerTrack.id;
  const isPlaying = isCurrentPlaybackTrack && playerIsPlaying;

  useEffect(() => {
    if (isCurrentPlaybackTrack && playerDuration > 0) {
      setKnownDurationSeconds((previous) =>
        Math.abs(previous - playerDuration) > 0.01 ? playerDuration : previous
      );
    }
  }, [isCurrentPlaybackTrack, playerDuration]);

  const waveformDurationSeconds =
    knownDurationSeconds > 0 ? knownDurationSeconds : playerTrack?.durationSeconds ?? 1;
  const waveformCurrentTime = isCurrentPlaybackTrack ? playerCurrentTime : 0;

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
    if (!hero || isLikePending || !playerTrack) {
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
        ? await trackService.likeTrack(playerTrack.id)
        : await trackService.unlikeTrack(playerTrack.id);
      setIsLiked(response.isLiked);
    } catch {
      setIsLiked(previous);
      setLikeCount((count) => Math.max(0, count - delta));
    } finally {
      setIsLikePending(false);
    }
  }, [hero, isLikePending, isLiked, playerTrack]);

  const onRepost = useCallback(async () => {
    if (!hero || isRepostPending || !playerTrack) {
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
        ? await trackService.repostTrack(playerTrack.id)
        : await trackService.unrepostTrack(playerTrack.id);
      setIsReposted(response.isReposted);
    } catch {
      setIsReposted(previous);
      setRepostCount((count) => Math.max(0, count - delta));
    } finally {
      setIsRepostPending(false);
    }
  }, [hero, isRepostPending, isReposted, playerTrack]);

  return {
    hero,
    waveformComments,
    pendingTimestamp,
    likeCount,
    repostCount,
    isLiked,
    isReposted,
    isPlaying,
    waveformCurrentTime,
    waveformDurationSeconds,
    isLoading,
    isError,
    onLike,
    onRepost,
    onPlayPause,
    onWaveformSeek,
  };
}
