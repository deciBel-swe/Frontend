'use client';

import PlaylistCard from '@/components/playlist/playlist-card/PlaylistCard';
import InfiniteScrollPagination from '@/components/pagination/InfiniteScrollPagination';
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
  const {
    feedItems,
    isLoading,
    isError,
    hasMore,
    isPaginating,
    sentinelRef,
  } = useFeedTracks(0, 10, true);

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
      <InfiniteScrollPagination
        hasMore={hasMore}
        isPaginating={isPaginating}
        sentinelRef={sentinelRef}
        loader={
          <div className="space-y-3 py-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`feed-append-${index}`}
                className="bg-surface-default rounded-lg h-40 animate-pulse"
              />
            ))}
          </div>
        }
      />
    </>
  );
}
