'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import type {
  PlayerTrack,
  QueueSource,
} from '@/features/player/contracts/playerContracts';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { ShareModal } from '@/features/prof/components/ShareModal';
import { trackService } from '@/services';
import { HoverPlayImage } from '@/components/sidebar/HoverPlayImage';
import TrackActions from '@/components/tracks/actions/TrackActions';
import { useCopyTrackLink } from '@/hooks/useCopyTrackLink';
import { useSecretLink } from '@/hooks/useSecretLink';
import { useTrackVisibility } from '@/hooks/useTrackVisibility';
import { formatDuration } from '@/utils/formatDuration';
import { useTrackCardPlayback } from '@/components/tracks/track-card/useTrackCardPlayback';
import { Track } from './CompactTrackList';

type CompactTrackItemProps = {
  track: Track;
  index: number;
  queueTracks?: PlayerTrack[];
  queueSource?: QueueSource;
};

const toUserSlug = (value: string): string =>
  value.toLowerCase().replace(/\s+/g, '');

export default function CompactTrackItem({
  track,
  index,
  queueTracks,
  queueSource,
}: CompactTrackItemProps) {
  const [hovered, setHovered] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isRepostPending, setIsRepostPending] = useState(false);
  const [isLiked, setIsLiked] = useState(Boolean(track.isLiked));
  const [isReposted, setIsReposted] = useState(Boolean(track.isReposted));
  const currentTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null);

  useEffect(() => {
    setIsLiked(Boolean(track.isLiked));
    setIsReposted(Boolean(track.isReposted));
  }, [track.id, track.isLiked, track.isReposted]);

  const artistSlug = toUserSlug(track.artistUsername?.trim() || track.artist);
  const trackPathId = track.trackSlug?.trim() || String(track.id);
  const trackHref = `/${artistSlug}/${trackPathId}`;
  const playback = useMemo(() => {
    const queuedTrack = queueTracks?.find((item) => item.id === track.id);
    if (queuedTrack) {
      return queuedTrack;
    }

    if (!track.trackUrl) {
      return undefined;
    }

    return playerTrackMappers.fromAdapterInput(
      {
        id: track.id,
        title: track.title,
        trackUrl: track.trackUrl,
        artist: track.artistUsername
          ? { username: track.artistUsername }
          : track.artist,
        durationSeconds: track.durationSeconds,
        coverUrl: track.coverUrl,
      },
      {
        access:
          track.access === 'BLOCKED' || track.access === 'PREVIEW'
            ? 'BLOCKED'
            : 'PLAYABLE',
        fallbackArtistName: track.artist,
      }
    );
  }, [
    queueTracks,
    track.access,
    track.artist,
    track.artistUsername,
    track.coverUrl,
    track.durationSeconds,
    track.id,
    track.title,
    track.trackUrl,
  ]);
  const effectiveQueueTracks =
    queueTracks && queueTracks.length > 0
      ? queueTracks
      : playback
        ? [playback]
        : undefined;
  const { visibility } = useTrackVisibility(track.id);
  const resolvedIsPrivate =
    visibility?.isPrivate ?? track.access === 'PREVIEW';
  const { secretUrl } = useSecretLink(
    resolvedIsPrivate ? String(track.id) : undefined,
    {
      shareUsername: track.artistUsername ?? track.artist,
      sharePathId: trackPathId,
    }
  );
  const { handleCopy } = useCopyTrackLink({
    trackId: String(track.id),
    routeTrackId: trackPathId,
    isPrivate: resolvedIsPrivate,
    secretUrl,
    artistName: track.artistUsername ?? track.artist,
    trackTitle: track.title,
  });
  const {
    isBlocked,
    isCurrentTrackPlaying,
    handlePlayFromCard,
  } = useTrackCardPlayback({
    track: {
      id: track.id,
      duration:
        typeof track.durationSeconds === 'number' && track.durationSeconds > 0
          ? formatDuration(track.durationSeconds)
          : '',
    },
    playback,
    queueTracks: effectiveQueueTracks,
    queueSource,
    onSeekSelect: () => {},
    onExternalTrackChange: () => {},
  });
  const isActive = Number(currentTrackId ?? -1) === Number(playback?.id ?? track.id);

  const handleLike = async () => {
    if (isLikePending) {
      return;
    }

    const previous = isLiked;
    const next = !previous;

    setIsLikePending(true);
    setIsLiked(next);

    try {
      if (next) {
        await trackService.likeTrack(track.id);
      } else {
        await trackService.unlikeTrack(track.id);
      }
    } catch {
      setIsLiked(previous);
    } finally {
      setIsLikePending(false);
    }
  };

  const handleRepost = async () => {
    if (isRepostPending) {
      return;
    }

    const previous = isReposted;
    const next = !previous;

    setIsRepostPending(true);
    setIsReposted(next);

    try {
      if (next) {
        await trackService.repostTrack(track.id);
      } else {
        await trackService.unrepostTrack(track.id);
      }
    } catch {
      setIsReposted(previous);
    } finally {
      setIsRepostPending(false);
    }
  };

  return (
    <>
      <li
        className={`compactTrackList__item group relative ${
          track.available === false || isBlocked ? 'opacity-50' : ''
        }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      >
        <div className="trackItem relative flex min-h-[32px] items-center gap-2 p-1">
          <div className="trackItem__image h-7 w-7 shrink-0">
            <HoverPlayImage
              image={track.coverUrl}
              alt={track.title}
              onClick={handlePlayFromCard}
            />
          </div>

          <div className="trackItem__numberWrapper w-4 shrink-0 text-[11px] font-bold text-text-muted">
            {index + 1}.
          </div>

          <div className="trackItem__content min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1">
              <Link
                href={`/${artistSlug}`}
                className="truncate text-[12px] text-text-muted hover:opacity-40"
              >
                {track.artist}
              </Link>
              <span className="text-[12px] text-text-muted">·</span>
              <Link
                href={trackHref}
                className={`trackItem__title block truncate text-[13px] font-bold hover:opacity-40 ${
                  isActive ? 'text-brand-primary' : 'text-primary'
                }`}
              >
                {track.title}
              </Link>
            </div>
          </div>

          <div
            className={`trackItem__plays mr-2 flex gap-1 text-[11px] font-bold text-text-muted transition-opacity duration-200 ${
              hovered ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Play size={14} />{' '}
            {isCurrentTrackPlaying ? 'Playing' : track.plays}
          </div>

          {(hovered || isActive) && (
            <TrackActions
              size={14}
              className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center bg-background/80 pl-2 backdrop-blur-sm"
              isLiked={isLiked}
              isReposted={isReposted}
              onLike={() => {
                void handleLike();
              }}
              onRepost={() => {
                void handleRepost();
              }}
              onShare={() => setIsShareOpen(true)}
              onCopy={() => {
                void handleCopy();
              }}
            />
          )}
        </div>
      </li>

      <ShareModal
        variant="track"
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trackId={String(track.id)}
        sharePathId={trackPathId}
        shareUsername={track.artistUsername}
        isPrivate={resolvedIsPrivate}
        existingToken={track.secretToken}
        track={{
          title: track.title,
          artist: track.artist,
          coverUrl: track.coverUrl,
          duration:
            typeof track.durationSeconds === 'number' && track.durationSeconds > 0
              ? formatDuration(track.durationSeconds)
              : undefined,
        }}
      />
    </>
  );
}
