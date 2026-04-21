'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWaveformData } from '@/hooks/useWaveformData';
import TrackCardArtwork from '@/components/tracks/track-card/TrackCardArtwork';
import TrackCardFooter from '@/components/tracks/track-card/TrackCardFooter';
import TrackCardHeader from '@/components/tracks/track-card/TrackCardHeader';
import TrackCardMeta from '@/components/tracks/track-card/TrackCardMeta';
import PlaylistTracks from '@/components/playlist/playlist-card/PlaylistTracks';
import TrackCardWaveformSection from '@/components/tracks/track-card/TrackCardWaveformSection';
import { useTrackCardPlayback } from '@/components/tracks/track-card/useTrackCardPlayback';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { playlistService } from '@/services';
import type { PlaylistHorizontalProps } from './types';

const toUserSlug = (value: string): string =>
  value.toLowerCase().replace(/\s+/g, '');

export default function PlaylistHorizontalRoot({
  trackId,
  user,
  postedText = 'posted a set',
  showEditButton = false,
  repostedBy,
  track,
  waveform,
  playback,
  queueTracks,
  queueSource,
  currentUserAvatar,
  showHeader = true,
  relatedTracks,
  onEdit,
}: PlaylistHorizontalProps) {
  const router = useRouter();
  const userSlug = toUserSlug(user.username);
  const userDisplayName = user.displayName?.trim() || user.username;
  const repostedBySlug = repostedBy?.username
    ? toUserSlug(repostedBy.username)
    : undefined;
  const repostedByDisplayName = repostedBy
    ? repostedBy.displayName?.trim() || repostedBy.username
    : undefined;
  const playlistPathId = track.playlistSlug?.trim() || trackId;
  const playlistHref = `/${userSlug}/sets/${playlistPathId}`;
  const addPlaylistToQueue = usePlayerStore((state) => state.addPlaylistToQueue);

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isRepostPending, setIsRepostPending] = useState(false);

  const [isLiked, setIsLiked] = useState(Boolean(track.isLiked));
  const [isReposted, setIsReposted] = useState(Boolean(track.isReposted));
  const [likeCount, setLikeCount] = useState(track.likeCount ?? 0);
  const [repostCount, setRepostCount] = useState(track.repostCount ?? 0);

  useEffect(() => {
    setIsLiked(Boolean(track.isLiked));
    setIsReposted(Boolean(track.isReposted));
    setLikeCount(track.likeCount ?? 0);
    setRepostCount(track.repostCount ?? 0);
    setIsDeleted(false);
  }, [track.id, track.isLiked, track.isReposted, track.likeCount, track.repostCount]);

  const handleCopy = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }

    const baseUrl =
      typeof window !== 'undefined' ? window.location.origin : '';
    const shareLink = `${baseUrl}${playlistHref}`;

    void navigator.clipboard.writeText(shareLink).catch(() => {});
  };

  const {
    isBlocked,
    isCurrentTrackPlaying,
    waveformCurrentTime,
    waveformDurationSeconds,
    handlePlayFromCard,
    handleWaveformClick,
    handleAddToQueue,
  } = useTrackCardPlayback({
    track,
    playback,
    queueTracks,
    queueSource,
    onSeekSelect: () => {},
    onExternalTrackChange: () => {},
  });

  const resolvedWaveform = useWaveformData(waveform, track.waveformUrl);

  const handleAddPlaylistTracksToQueue = () => {
    if (queueTracks && queueTracks.length > 0) {
      addPlaylistToQueue(queueTracks);
      return;
    }

    handleAddToQueue();
  };

  const handleLike = async () => {
    if (isLikePending) {
      return;
    }

    const previousLiked = isLiked;
    const previousLikeCount = likeCount;
    const nextLiked = !previousLiked;

    setIsLikePending(true);
    setIsLiked(nextLiked);
    setLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

    try {
      const response = nextLiked
        ? await playlistService.likePlaylist(track.id)
        : await playlistService.unlikePlaylist(track.id);

      if (typeof response.isLiked === 'boolean') {
        setIsLiked(response.isLiked);
      }
    } catch {
      setIsLiked(previousLiked);
      setLikeCount(previousLikeCount);
    } finally {
      setIsLikePending(false);
    }
  };

  const handleRepost = async () => {
    if (isRepostPending) {
      return;
    }

    const previousReposted = isReposted;
    const previousRepostCount = repostCount;
    const nextReposted = !previousReposted;

    setIsRepostPending(true);
    setIsReposted(nextReposted);
    setRepostCount((count) => Math.max(0, count + (nextReposted ? 1 : -1)));

    try {
      const response = nextReposted
        ? await playlistService.repostPlaylist(track.id)
        : await playlistService.unrepostPlaylist(track.id);

      if (typeof response.isReposted === 'boolean') {
        setIsReposted(response.isReposted);
      }
    } catch {
      setIsReposted(previousReposted);
      setRepostCount(previousRepostCount);
    } finally {
      setIsRepostPending(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!showEditButton || isDeletePending) {
      return;
    }

    const confirmed =
      typeof window === 'undefined'
        ? false
        : window.confirm('Delete this playlist?');

    if (!confirmed) {
      return;
    }

    setIsDeletePending(true);

    try {
      await playlistService.deletePlaylist(track.id);
      setIsDeleted(true);
    } finally {
      setIsDeletePending(false);
    }
  };

  if (isDeleted) {
    return null;
  }

  const currentUser = {
    name: userDisplayName,
    avatar: currentUserAvatar ?? user.avatar,
  };

  return (
    <div
      className={`my-3 w-full rounded-lg bg-surface-default p-2 text-text-primary sm:p-3 ${
        isBlocked ? 'opacity-60' : ''
      }`}
    >
      {showHeader ? (
        <TrackCardHeader
          userSlug={repostedBySlug ?? userSlug}
          userDisplayName={repostedByDisplayName ?? userDisplayName}
          userAvatar={user.avatar}
          postedText={postedText}
        />
      ) : null}

      <div className="flex min-w-0 items-start gap-2 sm:gap-3 md:gap-4">
        <TrackCardArtwork
          userSlug={userSlug}
          trackId={track.id}
          routeTrackId={playlistPathId}
          coverUrl={track.cover}
          title={track.title}
          contentHref={playlistHref}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <TrackCardMeta
            userSlug={userSlug}
            artistName={track.artist}
            trackId={track.id}
            routeTrackId={playlistPathId}
            title={track.title}
            contentHref={playlistHref}
            genre={track.genre}
            createdAt={track.createdAt}
            repostedBySlug={repostedBySlug}
            repostedByDisplayName={repostedByDisplayName}
            isBlocked={isBlocked}
            hasPlayback={Boolean(playback)}
            isCurrentTrackPlaying={isCurrentTrackPlaying}
            onPlayClick={handlePlayFromCard}
          />

          <TrackCardWaveformSection
            waveform={resolvedWaveform}
            isBlocked={isBlocked}
            waveformCurrentTime={waveformCurrentTime}
            waveformDurationSeconds={waveformDurationSeconds}
            timedComments={[]}
            currentUser={currentUser}
            pendingTimestamp={null}
            pendingText=""
            showCommentInput={false}
            waveformTimedCommentsVisible={false}
            onWaveformClick={handleWaveformClick}
            onCommentInputFocus={() => {}}
            setPendingText={() => {}}
            onSubmitTimedComment={() => {}}
          />

          <PlaylistTracks showTrackList tracks={relatedTracks} />

          <TrackCardFooter
            userSlug={userSlug}
            trackId={track.id}
            routeTrackId={playlistPathId}
            showEditButton={showEditButton}
            isLiked={isLiked}
            isReposted={isReposted}
            likeCount={likeCount}
            repostCount={repostCount}
            plays={track.plays}
            comments={undefined}
            canAddToQueue={Boolean(playback) || Boolean(queueTracks?.length)}
            isMoreOpen={isMoreOpen}
            onEdit={() => {
              if (!showEditButton && !onEdit) {
                return;
              }

              if (onEdit) {
                onEdit();
                return;
              }

              router.push(`${playlistHref}?edit=1`);
            }}
            onDelete={() => {
              void handleDeletePlaylist();
            }}
            onLike={() => {
              void handleLike();
            }}
            onRepost={() => {
              void handleRepost();
            }}
            onShare={() => {
              handleCopy();
            }}
            onCopy={handleCopy}
            onAddToQueue={handleAddPlaylistTracksToQueue}
            onMoreToggle={() => setIsMoreOpen((value) => !value)}
            onMoreClose={() => setIsMoreOpen(false)}
          />

          <div className="pt-1 text-xs text-text-muted">{track.duration}</div>
        </div>
      </div>
    </div>
  );
}
