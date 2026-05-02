'use client';

import { useParams } from 'next/navigation';
import InfiniteScrollPagination from '@/components/pagination/InfiniteScrollPagination';
import PlaylistCard from '@/components/playlist/playlist-card/PlaylistCard';
import TrackCard from '@/components/tracks/track-card/TrackCard';
import { TrackListFallBack } from '@/features/tracks/components/TrackListFallBack';
import { useUserRepostPage } from '@/hooks/useUserRepostPage';

export default function Page() {
  const { username } = useParams<{ username: string }>();
  const {
    items,
    isLoading,
    isError,
    hasMore,
    isPaginating,
    sentinelRef,
  } = useUserRepostPage(username, {
    size: 10,
    infinite: true,
  });

  if (isLoading) {
    return <TrackListFallBack />;
  }

  if (isError) {
    return (
      <p className="text-text-muted text-sm">
        Failed to load reposted resources. Please try again later.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-text-muted text-sm">
        No reposts published yet.
      </p>
    );
  }

  return (
    <div className="w-full min-w-0">
      {items.map((item) => {
        if (item.kind === 'track') {
          return <TrackCard key={item.id} {...item.card} />;
        }

        return <PlaylistCard key={item.id} {...item.card} />;
      })}
      <InfiniteScrollPagination
        hasMore={hasMore}
        isPaginating={isPaginating}
        sentinelRef={sentinelRef}
        loader={<TrackListFallBack />}
      />
    </div>
  );
}
