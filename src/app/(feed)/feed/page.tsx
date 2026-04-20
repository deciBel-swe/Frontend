'use client';

import TrackCard from '@/components/tracks/track-card/TrackCard';
import { useFeedTracks } from '@/hooks/useFeedTracks';

/**
 * Feed Page
 *
 * Renders all tracks fetched from the track service via useFeedTracks.
 * The two-column layout (feed + sidebar) is handled by FeedLayout.
 *
 * Following the layer convention:
 *  - Page   → minimal scaffolding, delegates data fetching to hook
 *  - Hook   → calls service, maps data to TrackCard shape
 *  - Layout → owns sidebar + two-column shell
 */
export default function FeedPage() {
  const { feedTracks, isLoading, isError } = useFeedTracks();

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-default rounded-lg h-40 animate-pulse"
          />
        ))}
      </>
    );
  }

  if (isError) {
    return (
      <p className="text-text-muted text-sm">
        Failed to load tracks. Please try again later.
      </p>
    );
  }

  if (feedTracks.length === 0) {
    return (
      <p className="text-text-muted text-sm">
        No tracks yet. Upload one to get started.
      </p>
    );
  }

  return (
    <>
      {feedTracks.map((item) => (
        <TrackCard
          key={item.id}
          trackId={String(item.id)}
          isPrivate={item.isPrivate}
          user={item.user}
          postedText={item.postedText}
          // timeAgo={item.timeAgo}
          showEditButton={false}
          track={item.track}
          waveform={item.waveform}
          playback={item.playback}
          queueTracks={item.queueTracks}
          queueSource="feed"
        />
      ))}
    </>
  );
}
