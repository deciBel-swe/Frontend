'use client';

import { useCopyTrackLink } from '@/hooks/useCopyTrackLink';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, MessageCircle, Repeat2 } from 'lucide-react';
import Button from '@/components/buttons/Button';
import Waveform from '@/components/waveform/Waveform';
import type { TrackCardPlaybackData } from '@/features/player/components/playerComponent.contracts';
import type {
  PlayerTrack,
  QueueSource,
} from '@/features/player/contracts/playerContracts';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { ShareModal } from '@/features/prof/components/ShareModal';
import { useSecretLink } from '@/hooks/useSecretLink';
import { useTrackVisibility } from '@/hooks/useTrackVisibility';
import EditTrackModal from '@/features/tracks/components/EditTrackModal';
import CompactTrackList from '@/components/CompactTrackList';
import TrackActions from '@/components/TrackActions';
import TimeAgo from '@/components/TimeAgo';
import CommentInput from '@/components/comments/CommentInput';
import WaveformTimedComments, {
  TimedComment,
} from '@/components/WaveformTimedComments';
import { parseDurationToSeconds } from '@/utils/parseDuration';

/**
 * Shallow queue identity check used to avoid resetting queue on every track click.
 */
const isSameQueue = (currentQueue: PlayerTrack[], incomingQueue: PlayerTrack[]): boolean => {
  if (currentQueue.length !== incomingQueue.length) {
    return false;
  }

  return currentQueue.every((track, index) => track.id === incomingQueue[index]?.id);
};

type TrackCardProps = {
  trackId: string;
  isPrivate?: boolean;
  
  user: {
    name: string;
    avatar: string;
  };
  postedText?: string;
  // timeAgo?: string;
  showEditButton?: boolean;
  repostedBy?: string;
  /** Show the inline comment input below the waveform */
  // showCommentInput?: boolean;
  /** Current user's avatar for the comment input */
  currentUserAvatar?: string;
    // New prop to conditionally show the track list
  showTrackList?: boolean;
  showHeader?: boolean; 

  track: {
    id: number;
    artist: string;
    title: string;
    cover: string;
    duration: string;
    plays?: number;        // optional number of plays
    comments?: number;     // optional number of messages/comments
    createdAt?: string; // ISO date
    genre?: string;
  };
  playback?: TrackCardPlaybackData;
  queueTracks?: PlayerTrack[];
  queueSource?: QueueSource;
  showComments?: boolean;
  waveform: number[];
};

export default function TrackCard({
  trackId,
  isPrivate = false,
  user,
  postedText = 'posted a track',
  // timeAgo = '',

  repostedBy,

  showEditButton = false,
  track,
  waveform,
  showTrackList = false,
  playback,
  queueTracks,
  queueSource,

  // timeAgoText = '',
  // showCommentInput = false,
  showHeader = true,

}: TrackCardProps) {
  const userSlug = user.name.toLowerCase().replace(/\s+/g, '');
  const trackSlug = track.title.toLowerCase().replace(/\s+/g, '-');
  const [editOpen, setEditOpen] = useState(false);

  const { visibility } = useTrackVisibility(Number(trackId));
  const resolvedIsPrivate = visibility?.isPrivate ?? isPrivate;

  // ── Share modal state
  const [isShareOpen, setIsShareOpen] = useState(false);

  // ── Fetch correct URL based on privacy
  const { secretUrl } = useSecretLink(resolvedIsPrivate ? trackId : undefined);

  // ── Use the centralized copy hook (bypasses useTrackMetadata entirely)
  const { handleCopy } = useCopyTrackLink({
    trackId,
    isPrivate: resolvedIsPrivate,
    secretUrl,
    artistName: track.artist,
    trackTitle: track.title,
  });

  const playerQueue = usePlayerStore((state) => state.queue);
  const currentPlayerTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null);
  const playerCurrentTime = usePlayerStore((state) => state.currentTime);
  const playerDuration = usePlayerStore((state) => state.duration);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const pausePlayback = usePlayerStore((state) => state.pause);
  const seek = usePlayerStore((state) => state.seek);

  // Existing comment/waveform UI local state retained from original card behavior.
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [pendingText, setPendingText] = useState('');
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [timedComments, setTimedComments] = useState<TimedComment[]>([]);
  const [waveformTimedCommentsVisible, setWaveformTimedCommentsVisible] = useState(false);
  const durationSeconds = parseDurationToSeconds(track.duration);
  const cardTrackId = playback?.id ?? track.id;

  // BLOCKED tracks disable interaction and dim card presentation.
  const isBlocked = playback?.access === 'BLOCKED';

  // Prefer playback-provided duration; fall back to local duration string parsing.
  const metadataDurationSeconds = playback?.durationSeconds ?? durationSeconds;
  const [knownDurationSeconds, setKnownDurationSeconds] = useState(
    metadataDurationSeconds > 0 ? metadataDurationSeconds : 0
  );

  useEffect(() => {
    if (metadataDurationSeconds > 0) {
      setKnownDurationSeconds((previous) =>
        Math.abs(previous - metadataDurationSeconds) > 0.01
          ? metadataDurationSeconds
          : previous
      );
    }
  }, [metadataDurationSeconds]);

  const isCurrentPlaybackTrack = usePlayerStore(
    (state) => Number(state.currentTrack?.id ?? -1) === Number(cardTrackId)
  );
  const isCurrentTrackPlaying = usePlayerStore(
    (state) =>
      Number(state.currentTrack?.id ?? -1) === Number(cardTrackId) && state.isPlaying
  );

  useEffect(() => {
    if (isCurrentPlaybackTrack && playerDuration > 0) {
      setKnownDurationSeconds((previous) =>
        Math.abs(previous - playerDuration) > 0.01 ? playerDuration : previous
      );
    }
  }, [isCurrentPlaybackTrack, playerDuration]);

  useEffect(() => {
    if (isCurrentPlaybackTrack) {
      return;
    }

    // When another track becomes active, reset local seek/comment UI state.
    setPendingTimestamp(null);
    setShowCommentInput(false);
    setWaveformTimedCommentsVisible(false);
  }, [isCurrentPlaybackTrack]);

  const waveformDurationSeconds = knownDurationSeconds;
  const waveformCurrentTime = isCurrentPlaybackTrack
    ? playerCurrentTime
    : 0;

  /**
   * Queue-aware play handler.
   * - sets queue when context queue differs
   * - starts playback for selected card track
   */
  const handlePlayFromCard = () => {
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
      const startIndex = queueTracks.findIndex((item) => item.id === playback.id);
      if (startIndex >= 0 && !isSameQueue(playerQueue, queueTracks)) {
        setQueue(queueTracks, startIndex, queueSource ?? 'unknown');
      }
    }

    playTrack(playback);
  };

  /**
   * Seek from waveform interaction.
   * Falls back to global player duration when card-level duration is missing.
   */
  const handleWaveformClick = (percent: number) => {
    if (isBlocked) {
      return;
    }

    if (playback) {
      const isSameTrack = Number(currentPlayerTrackId) === Number(playback.id);

      if (!isSameTrack) {
        if (queueTracks && queueTracks.length > 0) {
          const startIndex = queueTracks.findIndex((item) => item.id === playback.id);
          if (startIndex >= 0 && !isSameQueue(playerQueue, queueTracks)) {
            setQueue(queueTracks, startIndex, queueSource ?? 'unknown');
          }
        }

        playTrack(playback);
      } else if (!isCurrentTrackPlaying) {
        playTrack(playback);
      }
    }

    const seekDuration = waveformDurationSeconds;

    if (seekDuration <= 0) {
      return;
    }

    const timestamp = percent * seekDuration;

    if (playback) {
      seek(timestamp);
    }

    setPendingTimestamp(timestamp);
    setShowCommentInput(true);
  };

  return (
    <div className={`bg-surface-default text-text-primary p-2 sm:p-3 rounded-lg w-full my-3 ${isBlocked ? 'opacity-60' : ''}`}>
      {/* HEADER (soundContext) */}
      {showHeader && (
        <div className="flex items-center gap-2 mb-4 text-sm text-text-muted">
          <Link href={`/${userSlug}`}>
            <img
              src={user.avatar}
              className="w-8 h-8 rounded-full object-cover"
            />
          </Link>

        <div>
          <span className="text-text-primary font-medium hover:opacity-40">
            <Link href={`/${userSlug}`}>{user.name}</Link>
          </span>{' '}
          {postedText}
        </div>
        </div>
      )}

      {/* MAIN ROW */}
      <div className="flex gap-2 sm:gap-3 md:gap-4 items-start min-w-0">
        {/* LEFT IMAGE */}
        <Link
          href={`/${userSlug}/${trackSlug}`}
          className="w-24 sm:w-28 md:w-36 aspect-square flex-shrink-0 -mt-1"
        >
          <img
            src={track.cover}
            className="w-full h-full object-cover rounded"
          />
        </Link>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col flex-1 gap-2 min-w-0">
          {/* 1. NAME + PLAY */}
          <div className="flex items-center gap-3 h-12 px-2">
            <Button
              variant="ghost"
              onClick={handlePlayFromCard}
              disabled={isBlocked || !playback}
              aria-label={
                isBlocked
                  ? 'Playback blocked'
                  : isCurrentTrackPlaying
                    ? 'Pause track'
                    : 'Play track'
              }
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0 flex items-center justify-center group overflow-hidden"
            >
              {/* overlay */}
              <div className="absolute inset-0 bg-neutral-0 opacity-100 transition" />

              {isCurrentTrackPlaying ? (
                <span
                  aria-hidden="true"
                  className="relative z-10 inline-flex items-center gap-1"
                >
                  <span className="h-6 w-1.5 rounded-sm bg-neutral-1000" />
                  <span className="h-6 w-1.5 rounded-sm bg-neutral-1000" />
                </span>
              ) : (
                <Play
                  className="relative z-10 w-6 h-6 translate-x-[1px] text-neutral-1000 hover:opacity-40"
                  fill="currentColor"
                />
              )}
            </Button>

<div className="flex flex-col w-full">
<div className="flex items-center gap-2">
  <Link
    href={`/${userSlug}`}
    className="text-text-muted text-sm inline-flex self-start font-bold hover:opacity-40"
  >
    {track.artist}
  </Link>
   {repostedBy && (
      <>
        <Repeat2 size={15} className="text-text-muted shrink-0" aria-label="reposted by" />
          <Link
            href={`/${repostedBy.toLowerCase().replace(/\s+/g, '')}`}
            className="text-text-muted text-sm font-bold hover:opacity-40 shrink-0"
          >
            {repostedBy}
          </Link>
      </>
    )}

  {(track.createdAt || track.genre) && (
    <div className="ml-auto flex flex-col items-end gap-1">
      {track.createdAt && (
        <div className="text-xs text-text-muted text-[11px]">
          <TimeAgo date={track.createdAt} />
        </div>
      )}

      {track.genre && (
        <Link
          href={`/tags/${encodeURIComponent(track.genre)}`}
          className="inline-flex items-center px-2 py-1 leading-none rounded-full cursor-pointer 
           text-xs bg-interactive-default text-text-primary dark:bg-interactive-default dark:text-text-primary 
           hover:bg-interactive-hover dark:hover:bg-interactive-hover transition-colors scale-105"
        >
          <span className="mr-1 font-semibold">#</span>
          <span>{track.genre}</span>
        </Link>
      )}
    </div>
  )}
</div>


<div className='flex w-full'>
  <Link
    href={`/${userSlug}/${trackSlug}`}
    className="w-fit text-text-primary font-semibold inline-block hover:opacity-40"
  >
    {track.title}
  </Link>
{/* {track.genre && (
  <div className="flex-shrink-0 ml-auto">
    <Link
      href={`/tags/${encodeURIComponent(track.genre)}`}
      className="inline-flex items-center px-2 py-1 rounded-full cursor-pointer 
                 text-xs bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 
                 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    >
      <span className="mr-1 font-semibold">#</span>
      <span>{track.genre}</span>
    </Link>
  </div>
)} */}
    </div>
</div>
          </div>

          {/* 2. WAVEFORM */}
          {/* <div className="hidden sm:block px-1 sm:px-2 w-full min-w-0 overflow-hidden">
            <Waveform
              data={waveform}
              height={90}
              barClassName="bg-text-muted hover:bg-brand-primary"
            />
          </div> */}
          <div className="w-full relative">
  <Waveform
    data={waveform}
    barClassName={isBlocked ? 'bg-text-muted' : 'bg-text-muted hover:bg-brand-primary'}
    currentTime={waveformCurrentTime}
    durationSeconds={waveformDurationSeconds}
      onWaveformClick={handleWaveformClick}
  />
  <WaveformTimedComments
  comments={timedComments} // only old comments
  durationSeconds={waveformDurationSeconds}
  currentUser={{ name: user.name, avatar: user.avatar }}
  pendingTimestamp={null}   // nothing pending
  pendingText=""             // nothing pending
  setPendingText={() => {}} // noop
  showCommentInput={false}  // old comments don't show input
  onSubmit={() => {}}       // noop
  showMarkers={true}        // show markers for old comments
/>
{waveformTimedCommentsVisible && (
  <WaveformTimedComments
    comments={[]}  // empty, we only want the new comment
    durationSeconds={waveformDurationSeconds}
    currentUser={{ name: user.name, avatar: user.avatar }}
    pendingTimestamp={pendingTimestamp}
    pendingText={pendingText}
    setPendingText={setPendingText}
    showCommentInput={true}  // show while typing
    onSubmit={(text) => {
  if (pendingTimestamp === null) return;
  if (!text.trim()) return;

  setTimedComments((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      timestamp: pendingTimestamp, // now it's guaranteed number
      comment: text,
      user: { name: user.name, avatar: user.avatar },
    },
  ]);

  setPendingText('');
  setPendingTimestamp(null);
}}
    showMarkers={true}
/>
)}
</div>

          {/* 3. Inline comment input (shown on likes page) */}
          {showCommentInput && (
            <div className="px-1 sm:px-2">
             <CommentInput
               onFocus={() => {
    if (pendingTimestamp !== null) setWaveformTimedCommentsVisible(true);
  }}
  avatarUrl={user.avatar}
  value={pendingText}
  onChange={setPendingText}
  onSubmit={(text: string) => {
    if (pendingTimestamp === null) return;
    if (!text.trim()) return;

    setTimedComments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: pendingTimestamp,
        comment: text,
        user: { name: user.name, avatar: user.avatar },
      },
    ]);

    setPendingText('');
    setPendingTimestamp(null);
  }}
  placeholder="Write a comment…"
/>
            </div>
          )}

          {/* 2a. Track list */}
          {showTrackList && (
<CompactTrackList
  tracks={[
    {
      id: 1,
      title: 'No Promises',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-000244807472-dvac3y-t120x120.jpg',
      plays: '39.7M',
    },
    {
      id: 2,
      title: 'Undefeated (feat. 21 Savage)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-000244805227-4pqktm-t120x120.jpg',
      plays: '15.5M',
    },
    {
      id: 3,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 4,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 5,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 6,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
            {
      id: 7,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 8,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 9,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
            {
      id: 10,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 11,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 12,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
            {
      id: 13,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 14,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 15,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
  ]}
/>
)}
{/* {showComments && (
  <CommentInput user={user} onPost={handleCommentPost} />
)} */}

        <div className="flex items-center w-full">
  {/* LEFT: actions */}
  <TrackActions
    size={16}
    showEdit={showEditButton}
    onEdit={() => setEditOpen(true)}
    onLike={() => console.log('Liked', track.id)}
    onRepost={() => console.log('Reposted', track.id)}
    onShare={() => setIsShareOpen(true)}
    onCopy={handleCopy}
    onMore={() => console.log('More options', track.id)}
  />

{/* RIGHT: stats */}
<div className="ml-auto flex items-center gap-4 text-xs text-text-muted font-semibold">
  {track.plays && (
    <div className="flex items-center gap-1">
      <Play size={14} />
      <span>{track.plays}</span>
    </div>
  )}

  {track.comments && (
    <Link
      href={`/${userSlug}/${trackSlug}/comments`}
      className="flex items-center gap-1 hover:underline"
    >
      <MessageCircle size={14} />
      <span>{track.comments}</span>
    </Link>
  )}
</div>
</div>
</div>
        {/* DURATION */}
        <div className="text-xs text-text-muted pt-1">{track.duration}</div>
      </div>

      <ShareModal
        variant="track"
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trackId={trackId}
        isPrivate={resolvedIsPrivate}
        track={{
          title: track.title,
          artist: track.artist,
          coverUrl: track.cover,
          duration: track.duration,
        }}
      />

      <EditTrackModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        trackId={track.id}
        track={{ title: track.title, artist: track.artist, cover: track.cover }}
      />
    </div>
  );
}
