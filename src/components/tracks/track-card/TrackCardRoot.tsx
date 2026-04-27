'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@/features/auth';
import { useCopyTrackLink } from '@/hooks/useCopyTrackLink';
import { useTrackCard } from '@/hooks/useTrackCard';
import { useTrackVisibility } from '@/hooks/useTrackVisibility';
import { useWaveformData } from '@/hooks/useWaveformData';
import { useReportTrack } from '@/features/admin/hooks';
import ReportModal from '@/components/track-page/report/components/ReportModal';
import type { ActiveTab } from '@/components/playlist/AddToPlaylistModal';
import TrackCardArtwork from './TrackCardArtwork';
import TrackCardFooter from './TrackCardFooter';
import TrackCardHeader from './TrackCardHeader';
import TrackCardMeta from './TrackCardMeta';
import TrackCardModals from './TrackCardModals';
import TrackCardWaveformSection from './TrackCardWaveformSection';
import { useTrackCardPlayback } from './useTrackCardPlayback';
import type { TrackCardProps } from './types';

const toUserSlug = (value: string): string =>
  value.toLowerCase().replace(/\s+/g, '');

export default function TrackCardRoot({
  trackId,
  isPrivate = false,
  user,
  postedText = 'posted a track',
  repostedBy,
  showEditButton = false,
  track,
  waveform,
  playback,
  queueTracks,
  queueSource,
  currentUserAvatar,
  showHeader = true,
}: TrackCardProps) {
  const { user: authUser } = useAuth();
  const userSlug = toUserSlug(user.username);
  const contentUserSlug = toUserSlug(track.artist.username);
  const routeTrackId = track.trackSlug?.trim() || String(track.id);
  const userDisplayName = user.displayName?.trim() || user.username;
  const artistDisplayName =
    track.artist.displayName?.trim() || track.artist.username;
  const artistUsername = track.artist.username;
  const repostedBySlug = repostedBy?.username
    ? toUserSlug(repostedBy.username)
    : undefined;
  const repostedByDisplayName = repostedBy
    ? repostedBy.displayName?.trim() || repostedBy.username
    : undefined;

  const [editOpen, setEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('add');

  const { visibility } = useTrackVisibility(Number(trackId));
  const resolvedIsPrivate = visibility?.isPrivate ?? isPrivate;
  const { handleCopy } = useCopyTrackLink({
    trackId,
    routeTrackId,
    isPrivate: resolvedIsPrivate,
    secretToken: track.secretToken,
    artistName: artistUsername,
    trackTitle: track.title,
  });
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
    trackId: Number(playback?.id ?? track.id),
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

  const [isReportOpen, setIsReportOpen] = useState(false);
  const { reportTrack, isLoading: isReportSubmitting } = useReportTrack();

  const openTrackReport = useCallback(() => {
    setIsReportOpen(true);
  }, []);

  const closeReport = useCallback(() => {
    setIsReportOpen(false);
  }, []);

  const submitReport = useCallback(
    async (reason: string, details?: string) => {
      if (!track?.id) {
        return;
      }

      try {
        await reportTrack(track.id, { reason, description: details });
      } finally {
        closeReport();
      }
    },
    [closeReport, reportTrack, track?.id]
  );

  /**
   * Whether to show the report option. We hide it when the viewer is the
   * track owner (same logic used to show the edit button).
   */
  // const canReport = !showEditButton;
 
  if (isDeleted) {
    return null;
  }

  const currentUserName =
    authUser?.displayName?.trim() || authUser?.username?.trim() || userDisplayName;
  const currentUserAvatarSrc =
    authUser?.avatarUrl?.trim() || currentUserAvatar || user.avatar;
  const headerAvatar = repostedBy?.avatar?.trim() || user.avatar;
  const currentUser = {
    name: currentUserName,
    avatar: currentUserAvatarSrc,
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
          userAvatar={headerAvatar}
          postedText={postedText}
        />
      ) : null}

      <div className="flex min-w-0 items-start gap-2 sm:gap-3 md:gap-4">
        <TrackCardArtwork
          userSlug={contentUserSlug}
          trackId={track.id}
          routeTrackId={routeTrackId}
          coverUrl={track.cover}
          title={track.title}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <TrackCardMeta
            userSlug={contentUserSlug}
            artistName={artistDisplayName}
            trackId={track.id}
            routeTrackId={routeTrackId}
            title={track.title}
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

          <TrackCardFooter
            userSlug={contentUserSlug}
            trackId={track.id}
            routeTrackId={routeTrackId}
            showEditButton={showEditButton}
            isLiked={isLiked}
            isReposted={isReposted}
            likeCount={likeCount}
            repostCount={repostCount}
            plays={track.plays}
            comments={track.comments}
            canAddToQueue={Boolean(playback)}
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
            onAddToQueue={handleAddToQueue}
            onMoreToggle={() => setIsMoreOpen((value) => !value)}
            onMoreClose={() => setIsMoreOpen(false)}
            onAddToPlaylist={() => setIsPlaylistModalOpen(true)}
            onStation={() => {}}
            onReport={openTrackReport}
          />

          {/* <div className="pt-1 text-xs text-text-muted">{track.duration}</div> */}
        </div>
      </div>

      <TrackCardModals
        trackId={trackId}
        routeTrackId={routeTrackId}
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
      <ReportModal
            isOpen={isReportOpen}
            target="track"
            isSubmitting={isReportSubmitting}
            onClose={closeReport}
            onSubmit={submitReport}
          />
    </div>
  );
}
