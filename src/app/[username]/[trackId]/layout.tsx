'use client';

import { useState, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { ShareModal } from '@/features/prof/components/ShareModal';
import TrackActionBar from '@/components/tracks/actions/TrackActionBar';
import TrackHero from '@/components/track-page/TrackHero';
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
          />

          <ShareModal
            variant="track"
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            trackId={trackId}
            sharePathId={hero.trackSlug?.trim() || trackId}
            shareUsername={hero.artistSlug}
            isPrivate={hero.isPrivate}
            existingToken={hero.secretToken}
            track={{
              title: hero.title,
              artist: hero.artistName,
              coverUrl: hero.coverUrl,
              duration: hero.duration,
              waveformData: hero.waveformData,
              waveformUrl: hero.waveformUrl,
              isPlaying,
              currentTime: waveformCurrentTime,
              durationSeconds: waveformDurationSeconds,
              onPlayPause,
              onWaveformSeek,
            }}
          />
        </div>
      )}

      {children}
    </div>
  );
}
