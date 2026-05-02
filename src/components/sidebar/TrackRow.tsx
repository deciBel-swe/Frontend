'use client';

import Link from 'next/link';
import {
  Play,
  Heart,
  MessageCircle,
  Repeat,
} from 'lucide-react';
import React from 'react';
import { HoverPlayImage } from '@/components/sidebar/HoverPlayImage';
import type {
  PlayerTrack,
  QueueSource,
} from '@/features/player/contracts/playerContracts';
import { usePlayerStore } from '@/features/player/store/playerStore';

interface TrackStats {
  plays: string;
  likes: string;
  reposts: string;
  comments: string;
}

interface TrackRowProps {
  trackId?: string | number;
  image: string;
  artist: string;
  artistUsername?: string;
  title: string;
  trackSlug?: string;
  stats: TrackStats;
  playback?: PlayerTrack;
  queueTracks?: PlayerTrack[];
  queueSource?: QueueSource;

  // Optional callbacks for the actions
  onLike?: () => void;
  onMore?: () => void;
}

const isSameQueue = (currentQueue: PlayerTrack[], incomingQueue: PlayerTrack[]): boolean => {
  if (currentQueue.length !== incomingQueue.length) {
    return false;
  }

  return currentQueue.every((track, index) => track.id === incomingQueue[index]?.id);
};

const TrackRow: React.FC<TrackRowProps> = ({
  trackId,
  image,
  artist,
  artistUsername,
  title,
  stats,
  trackSlug,
  playback,
  queueTracks,
  queueSource,
}) => {
  const playerQueue = usePlayerStore((state) => state.queue);
  const currentPlayerTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null);
  const isCurrentTrackPlaying = usePlayerStore(
    (state) => Number(state.currentTrack?.id ?? -1) === Number(playback?.id ?? -1) && state.isPlaying
  );
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const pausePlayback = usePlayerStore((state) => state.pause);

  const artistSlugSource = artistUsername ?? artist;
  const artistSlug = encodeURIComponent(artistSlugSource.toLowerCase().replace(/\s+/g, ''));

  const artistUrl = `/${artistSlug}`;
  const trackUrl = `/${artistSlug}/${trackSlug ?? trackId}`;

  const isBlocked = playback?.access === 'BLOCKED';

  const handlePlayFromRow = () => {
    if (!playback || isBlocked) {
      return;
    }

    const isSameTrack = Number(currentPlayerTrackId) === Number(playback.id);
    if (isSameTrack) {
      if (isCurrentTrackPlaying) {
        pausePlayback();
        return;
      }

      playTrack(playback);
      return;
    }

    if (queueTracks && queueTracks.length > 0) {
      const startIndex = queueTracks.findIndex((track) => track.id === playback.id);
      if (startIndex >= 0 && !isSameQueue(playerQueue, queueTracks)) {
        setQueue(queueTracks, startIndex, queueSource ?? 'unknown');
      }
    }

    playTrack(playback);
  };

  const statsLinks = {
    plays: trackUrl,
    likes: `${trackUrl}/likes`,
    reposts: `${trackUrl}/reposts`,
    comments: trackUrl,
  };

  return (
    <div className="group flex w-full items-center gap-3 px-2 py-2 rounded-xl transition hover:bg-surface-raised">
      {/* IMAGE WRAPPER (controls size now) */}
      <div className="w-12 h-12 md:w-12 md:h-12 shrink-0">
        <HoverPlayImage image={image} alt={title} onClick={handlePlayFromRow} />
      </div>

      {/* TEXT SECTION */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center w-full mb-1">
          {/* LEFT: TEXT */}
          <div className="flex flex-col min-w-0">
            <Link
              href={artistUrl}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              {artist}
            </Link>

            <Link
              href={trackUrl}
              className="text-sm font-semibold truncate transition group-hover:text-text-primary"
            >
              {title}
            </Link>
          </div>

          {/* SPACER (THIS PUSHES BUTTONS RIGHT) */}
          <div className="flex-1" />

          {/* RIGHT: ACTION BUTTONS */}


        </div>
        {/* STATS */}
        <div className="flex items-center gap-3 text-xs mt-1">
          <p className="flex items-center gap-1 text-text-muted transition group-hover:text-text-primary">
            <Play size={14} /> {stats.plays}
          </p>

          <Link
            href={statsLinks.likes}
            className="flex items-center gap-1 hover:text-status-error transition"
          >
            <Heart size={14} /> {stats.likes}
          </Link>

          <Link
            href={statsLinks.reposts}
            className="flex items-center gap-1 hover:text-status-success transition"
          >
            <Repeat size={14} /> {stats.reposts}
          </Link>

          <Link
            href={statsLinks.comments}
            className="flex items-center gap-1 hover:text-status-info transition"
          >
            <MessageCircle size={14} /> {stats.comments}
          </Link>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      {/* <div className="hidden group-hover:flex items-center gap-2">
        <Button className="p-2 rounded-lg bg-surface hover:opacity-80 transition" variant="secondary">
          <Heart size={18} />
        </Button>

        <Button className="p-2 rounded-lg bg-surface hover:opacity-80 transition" variant="secondary">
          <MoreHorizontal size={18} />
        </Button>
      </div> */}
    </div>
  );
};

export default TrackRow;
