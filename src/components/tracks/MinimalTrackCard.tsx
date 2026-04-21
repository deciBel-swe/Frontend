'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart, Repeat2 } from 'lucide-react';

import { HoverPlayImage } from '@/components/sidebar/HoverPlayImage';
import type { TrackListItem } from '@/components/tracks/TrackList';
import type {
  PlayerTrack,
  QueueSource,
} from '@/features/player/contracts/playerContracts';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { trackService } from '@/services';
import { Button } from '../buttons/Button';

const isSameQueue = (currentQueue: PlayerTrack[], incomingQueue: PlayerTrack[]): boolean => {
  if (currentQueue.length !== incomingQueue.length) {
    return false;
  }

  return currentQueue.every((track, index) => track.id === incomingQueue[index]?.id);
};

type MinimalTrackCardProps = {
  item: TrackListItem;
  queueTracks: PlayerTrack[];
  queueSource?: QueueSource;
};

export default function MinimalTrackCard({
  item,
  queueTracks,
  queueSource = 'likes',
}: MinimalTrackCardProps) {
  const playerQueue = usePlayerStore((state) => state.queue);
  const currentPlayerTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null);
  const isCurrentTrackPlaying = usePlayerStore(
    (state) => Number(state.currentTrack?.id ?? -1) === Number(item.track.id) && state.isPlaying
  );
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const pausePlayback = usePlayerStore((state) => state.pause);
  const [isLiked, setIsLiked] = useState(item.track.isLiked ?? false);
  const [isReposted, setIsReposted] = useState(item.track.isReposted ?? false);
  const [likeCount, setLikeCount] = useState(item.track.likeCount ?? 0);
  const [repostCount, setRepostCount] = useState(item.track.repostCount ?? 0);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isRepostPending, setIsRepostPending] = useState(false);

  const playbackTrack = useMemo(() => {
    if (item.playback) {
      return item.playback;
    }

    if (!item.trackUrl) {
      return null;
    }

    return playerTrackMappers.fromAdapterInput(
      {
        id: item.track.id,
        title: item.track.title,
        trackUrl: item.trackUrl,
        artist: item.track.artist,
        coverUrl: item.track.cover,
        waveformData: item.waveform,
        durationSeconds: item.track.durationSeconds,
      },
      { access: item.access ?? 'PLAYABLE' }
    );
  }, [item]);

  const isBlocked = playbackTrack?.access === 'BLOCKED';

  const artistUsername = item.track.artist.username;
  const userSlug = artistUsername.toLowerCase().replace(/\s+/g, '');
  const trackRouteId = item.track.trackSlug?.trim() || String(item.track.id);
  const trackLink = `/${userSlug}/${trackRouteId}`;

  const handlePlayFromCard = () => {
    if (!playbackTrack || isBlocked) {
      return;
    }

    const isSameTrack = Number(currentPlayerTrackId) === Number(playbackTrack.id);
    if (isSameTrack) {
      if (isCurrentTrackPlaying) {
        pausePlayback();
        return;
      }

      playTrack(playbackTrack);
      return;
    }

    const startIndex = queueTracks.findIndex((track) => track.id === playbackTrack.id);
    if (startIndex >= 0 && !isSameQueue(playerQueue, queueTracks)) {
      setQueue(queueTracks, startIndex, queueSource);
    }

    playTrack(playbackTrack);
  };

  const handleLike = useCallback(async () => {
    if (isLikePending) {
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
        ? await trackService.likeTrack(item.track.id)
        : await trackService.unlikeTrack(item.track.id);
      setIsLiked(response.isLiked);
    } catch {
      setIsLiked(previous);
      setLikeCount((count) => Math.max(0, count - delta));
    } finally {
      setIsLikePending(false);
    }
  }, [isLikePending, isLiked, item.track.id]);

  const handleRepost = useCallback(async () => {
    if (isRepostPending) {
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
        ? await trackService.repostTrack(item.track.id)
        : await trackService.unrepostTrack(item.track.id);
      setIsReposted(response.isReposted);
    } catch {
      setIsReposted(previous);
      setRepostCount((count) => Math.max(0, count - delta));
    } finally {
      setIsRepostPending(false);
    }
  }, [isRepostPending, isReposted, item.track.id]);

  return (
    <div
      className={`
        relative shrink-0
        w-26 h-26
        md:w-32 md:h-32
        lg:w-40 lg:h-40
        rounded-md
        m-2
        ${isBlocked ? 'opacity-60' : ''}
      `}
    >
      <div className="group relative cursor-pointer h-full w-full rounded-md overflow-hidden">
        <HoverPlayImage
          image={item.track.cover}
          alt={item.track.title}
          onClick={handlePlayFromCard}
        />

        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="hidden sm:flex absolute inset-x-0 bottom-1 justify-end gap-1 px-2">
            <Button
              type="button"
              variant={isLiked ? 'ghost_highlight' : 'ghost'}
              aria-label="Like track"
              onClick={() => {
                void handleLike();
              }}
              className={`pointer-events-auto h-8 rounded-full px-2 flex items-center justify-center gap-1 ${
                isLiked ? 'text-brand-primary' : 'hover:text-brand-primary'
              }`}
              disabled={isLikePending}
            >
              <Heart size={16} />
              <span className="text-[11px] font-semibold">{likeCount}</span>
            </Button>

            <Button
              type="button"
              variant={isReposted ? 'ghost_highlight' : 'ghost'}
              aria-label="Repost track"
              onClick={() => {
                void handleRepost();
              }}
              className={`pointer-events-auto h-8 rounded-full px-2 flex items-center justify-center gap-1 ${
                isReposted ? 'text-brand-primary' : 'hover:text-brand-primary'
              }`}
              disabled={isRepostPending}
            >
              <Repeat2 size={16} />
              <span className="text-[11px] font-semibold">{repostCount}</span>
            </Button>
          </div>
        </div>
      </div>

      <Link
        href={trackLink}
        className="mt-3 text-sm font-medium text-text-primary truncate block hover:text-text-secondary transition-colors"
      >
        {item.track.title}
      </Link>
    </div>
  );
}
