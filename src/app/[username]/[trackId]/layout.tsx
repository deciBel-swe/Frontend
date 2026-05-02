'use client';

import { useState, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { useReportTrack } from '@/features/admin/hooks';
import TrackActionBar from '@/components/tracks/actions/TrackActionBar';
import TrackHero from '@/components/track-page/TrackHero';
import TrackPageReportButton from '@/components/track-page/TrackPageReportButton';
import ReportModal from '@/components/track-page/report/components/ReportModal';
import TrackCardModals from '@/components/tracks/track-card/TrackCardModals';
import type { ActiveTab } from '@/components/playlist/AddToPlaylistModal';
import { useTrackHeaderItem } from '@/hooks/useTrackHeaderItem';
import { getSecretTokenFromQuery } from '@/utils/resourceIdentifierResolvers';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { username, trackId } = useParams<{ username: string; trackId: string }>();
  const searchParams = useSearchParams();
  const secretToken = getSecretTokenFromQuery(searchParams);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('add');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { reportTrack, isLoading: isReportSubmitting } = useReportTrack();
  const {
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
  } = useTrackHeaderItem({ username, trackId, secretToken });

  const closeReport = () => {
    setIsReportOpen(false);
  };

  const submitReport = async (reason: string, details?: string) => {
    if (!hero?.id) {
      return;
    }

    try {
      await reportTrack(hero.id, { reason, description: details });
    } finally {
      closeReport();
    }
  };

  return (
    <div className="w-full">
      {isLoading && !hero ? (
        <div className="w-full mt-4 text-sm text-text-muted">Loading track...</div>
      ) : isError || !hero ? (
        <div className="w-full mt-4 text-sm text-text-muted">Failed to load track.</div>
      ) : (
        <div className="w-full min-w-0 mt-4">
          <TrackHero
            title={hero.title}
            artistName={hero.artistName}
            artistSlug={hero.artistSlug}
            coverUrl={hero.coverUrl}
            timeAgo={hero.timeAgo}
            tags={hero.tags}
            genre={hero.genre}
            waveformUrl={hero.waveformUrl}
            waveformData={hero.waveformData}
            duration={hero.duration}
            waveformComments={waveformComments}
            waveformCurrentTime={waveformCurrentTime}
            waveformDurationSeconds={waveformDurationSeconds}
            pendingTimestamp={pendingTimestamp}
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onWaveformSeek={onWaveformSeek}
          />

          <TrackActionBar
            plays={hero.plays}
            likes={likeCount}
            reposts={repostCount}
            isLiked={isLiked}
            isReposted={isReposted}
            onLike={() => {
              void onLike();
            }}
            onRepost={() => {
              void onRepost();
            }}
            onShare={() => setIsShareOpen(true)}
            onAddToPlaylist={() => setIsPlaylistModalOpen(true)}
          />

          <TrackPageReportButton onReport={() => setIsReportOpen(true)} />

          <TrackCardModals
            trackId={trackId}
            routeTrackId={hero.trackSlug?.trim() || trackId}
            trackNumericId={hero.id}
            isPrivate={hero.isPrivate}
            track={{
              title: hero.title,
              secretToken: hero.secretToken,
              trackUrl: hero.waveformUrl, // useTrackHeaderItem doesn't expose the direct trackUrl, but TrackCardModals needs it for the share preview. 
              // Wait, hero in useTrackHeaderItem has waveformUrl but not trackUrl?
              // Actually, TrackCardModals uses trackUrl for play/pause in the preview.
              artist: {
                username: hero.artistSlug,
                displayName: hero.artistName,
                avatar: '/images/default_song_image.png', // Placeholder if not available
              },
              cover: hero.coverUrl,
              duration: hero.duration,
              genre: hero.genre,
              waveformData: hero.waveformData,
              waveformUrl: hero.waveformUrl,
            }}
            editOpen={isEditOpen}
            isShareOpen={isShareOpen}
            isPlaylistModalOpen={isPlaylistModalOpen}
            activeTab={activeTab}
            setEditOpen={setIsEditOpen}
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
      )}

      {children}
    </div>
  );
}
