'use client';

import { useState, type ReactNode } from 'react';
import { useParams } from 'next/navigation';

import TrackActionBar from '@/components/TrackActionBar';
import TrackHero from '@/components/TrackHero';
import AddToPlaylistModal from '@/components/playlist/AddToPlaylistModal';
import { useTrackHeaderItem } from '@/hooks/useTrackHeaderItem';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { username, trackId } = useParams<{
    username: string;
    trackId: string;
  }>();
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

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
  } = useTrackHeaderItem({ username, trackId });

  return (
    <div className="w-full">
      {isLoading && !hero ? (
        <div className="w-full mt-4 text-sm text-text-muted">
          Loading track...
        </div>
      ) : isError || !hero ? (
        <div className="w-full mt-4 text-sm text-text-muted">
          Failed to load track.
        </div>
      ) : (
        <div className="w-full min-w-0 mt-4">
          <TrackHero
            title={hero.title}
            artistName={hero.artistName}
            artistSlug={hero.artistSlug}
            coverUrl={hero.coverUrl}
            timeAgo={hero.timeAgo}
            tags={hero.tags}
            waveformUrl={hero.waveformUrl}
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
            onAddToPlaylist={() => setIsPlaylistModalOpen(true)}
          />

          <AddToPlaylistModal
            open={isPlaylistModalOpen}
            onClose={() => setIsPlaylistModalOpen(false)}
            trackId={Number(trackId)}
            track={{
              title: hero.title,
              artist: hero.artistName,
              coverUrl: hero.coverUrl,
            }}
          />
        </div>
      )}

      {children}
    </div>
  );
}
