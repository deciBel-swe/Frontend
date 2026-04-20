'use client';

import { useState } from 'react';
import { useTrackCard } from '@/hooks/useTrackCard';
import { useWaveformData } from '@/hooks/useWaveformData';
import type { ActiveTab } from '@/components/playlist/AddToPlaylistModal';
import TrackCardArtwork from '@/components/tracks/track-card/TrackCardArtwork';
import TrackCardFooter from '@/components/tracks/track-card/TrackCardFooter';
import TrackCardHeader from '@/components/tracks/track-card/TrackCardHeader';
import TrackCardMeta from '@/components/tracks/track-card/TrackCardMeta';
import TrackCardModals from '@/components/tracks/track-card/TrackCardModals';
import PlaylistTracks from '@/components/playlist/playlist-card/PlaylistTracks';
import TrackCardWaveformSection from '@/components/tracks/track-card/TrackCardWaveformSection';
import { useTrackCardPlayback } from '@/components/tracks/track-card/useTrackCardPlayback';
import { usePlayerStore } from '@/features/player/store/playerStore';
import type { PlaylistHorizontalProps } from './types';

const toUserSlug = (value: string): string =>
  value.toLowerCase().replace(/\s+/g, '');

export default function PlaylistHorizontalRoot({
  trackId,
  isPrivate = false,
  user,
  postedText = 'posted a set',
  // repostedBy,
  showEditButton = false,
  track,
  waveform,
  playback,
  queueTracks,
  queueSource,
  currentUserAvatar,
  showHeader = true,
  relatedTracks,
}: PlaylistHorizontalProps) {
  const userSlug = toUserSlug(user.username);
  const userDisplayName = user.displayName?.trim() || user.username;
  const playlistHref = `/${userSlug}/sets/${trackId}`;
  // const repostedBySlug = repostedBy?.username
  //   ? toUserSlug(repostedBy.username)
  //   : undefined;
  // const repostedByDisplayName = repostedBy
  //   ? repostedBy.displayName?.trim() || repostedBy.username
  //   : undefined;

  const [editOpen, setEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('add');
  const addPlaylistToQueue = usePlayerStore((state) => state.addPlaylistToQueue);

  const resolvedIsPrivate = isPrivate;

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
    timedComments,
    pendingText,
    pendingTimestamp,
    showCommentInput,
    waveformTimedCommentsVisible,
    isDeleted,
    likeCount,
    repostCount,
    isLiked,
    isReposted,
    isDeletePending,
    setPendingText,
    selectTimestamp,
    onCommentInputFocus,
    clearPendingCommentSelection,
    submitTimedComment,
    onLike,
    onRepost,
    onDeleteTrack,
  } = useTrackCard({
    trackId: track.id,
    initialIsLiked: track.isLiked,
    initialIsReposted: track.isReposted,
    initialLikeCount: track.likeCount,
    initialRepostCount: track.repostCount,
  });

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
    onSeekSelect: selectTimestamp,
    onExternalTrackChange: clearPendingCommentSelection,
  });

  const resolvedWaveform = useWaveformData(waveform, track.waveformUrl);

  const handleAddPlaylistTracksToQueue = () => {
    if (queueTracks && queueTracks.length > 0) {
      addPlaylistToQueue(queueTracks);
      return;
    }

    handleAddToQueue();
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
          userSlug={userSlug}
          userDisplayName={userDisplayName}
          userAvatar={user.avatar}
          postedText={postedText}
        />
      ) : null}

      <div className="flex min-w-0 items-start gap-2 sm:gap-3 md:gap-4">
        <TrackCardArtwork
          userSlug={userSlug}
          trackId={track.id}
          coverUrl={track.cover}
          title={track.title}
          contentHref={playlistHref}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <TrackCardMeta
            userSlug={userSlug}
            artistName={track.artist}
            trackId={track.id}
            title={track.title}
            contentHref={playlistHref}
            genre={track.genre}
            createdAt={track.createdAt}
            // repostedBySlug={repostedBySlug}
            // repostedByDisplayName={repostedByDisplayName}
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
            timedComments={timedComments}
            currentUser={currentUser}
            pendingTimestamp={pendingTimestamp}
            pendingText={pendingText}
            showCommentInput={showCommentInput}
            waveformTimedCommentsVisible={waveformTimedCommentsVisible}
            onWaveformClick={handleWaveformClick}
            onCommentInputFocus={onCommentInputFocus}
            setPendingText={setPendingText}
            onSubmitTimedComment={(text) => {
              void submitTimedComment(text);
            }}
          />

          <PlaylistTracks showTrackList tracks={relatedTracks} />

          <TrackCardFooter
            userSlug={userSlug}
            trackId={track.id}
            showEditButton={showEditButton}
            isLiked={isLiked}
            isReposted={isReposted}
            likeCount={likeCount}
            repostCount={repostCount}
            plays={track.plays}
            comments={undefined}
            canAddToQueue={Boolean(playback) || Boolean(queueTracks?.length)}
            isMoreOpen={isMoreOpen}
            onEdit={() => setEditOpen(true)}
            onDelete={() => {
              if (!showEditButton || isDeletePending) {
                return;
              }

              const confirmed =
                typeof window === 'undefined'
                  ? false
                  : window.confirm('Delete this track?');

              if (!confirmed) {
                return;
              }

              void onDeleteTrack();
            }}
            onLike={() => {
              void onLike();
            }}
            onRepost={() => {
              void onRepost();
            }}
            onShare={() => setIsShareOpen(true)}
            onCopy={handleCopy}
            onAddToQueue={handleAddPlaylistTracksToQueue}
            onMoreToggle={() => setIsMoreOpen((value) => !value)}
            onMoreClose={() => setIsMoreOpen(false)}
          />

          <div className="pt-1 text-xs text-text-muted">{track.duration}</div>
        </div>
      </div>

      <TrackCardModals
        trackId={trackId}
        trackNumericId={track.id}
        isPrivate={resolvedIsPrivate}
        track={track}
        editOpen={editOpen}
        isShareOpen={isShareOpen}
        isPlaylistModalOpen={isPlaylistModalOpen}
        activeTab={activeTab}
        setEditOpen={setEditOpen}
        setIsShareOpen={setIsShareOpen}
        setIsPlaylistModalOpen={setIsPlaylistModalOpen}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
