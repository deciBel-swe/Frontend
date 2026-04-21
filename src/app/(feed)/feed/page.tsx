'use client';

import PlaylistCard from '@/components/playlist/playlist-card/PlaylistCard';
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
  const { feedItems, isLoading, isError } = useFeedTracks();

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

  if (feedItems.length === 0) {
    return (
      <p className="text-text-muted text-sm">
        No feed items yet.
      </p>
    );
  }

  return (
    <>
      {feedItems.map((item) => {
        if (item.kind === 'track') {
          return <TrackCard key={item.id} {...item.card} queueSource="feed" />;
        }

        return <PlaylistCard key={item.id} {...item.card} queueSource="feed" />;
      })}
    </>
  );
}
