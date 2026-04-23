'use client';

import PlaylistCard from '@/components/playlist/playlist-card/PlaylistCard';
import InfiniteScrollPagination from '@/components/pagination/InfiniteScrollPagination';
import { useUserPlaylistsPage } from '@/hooks/useUserPlaylistsPage';
import { useParams } from 'next/navigation';

const PlaylistListFallback = () => (
  <>
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="bg-surface-default rounded-lg h-40 animate-pulse"
      />
    ))}
  </>
);

export default function Page() {
  const { username } = useParams<{ username: string }>();
  const {
    cards,
    isLoading,
    isError,
    hasMore,
    isPaginating,
    sentinelRef,
  } = useUserPlaylistsPage({
    username,
    size: 24,
    infinite: true,
  });

  if (isLoading) {
    return <PlaylistListFallback />;
  }

  if (isError) {
    return (
      <p className="text-text-muted text-sm">
        Failed to load playlists. Please try again later.
      </p>
    );
  }

  if (cards.length === 0) {
    return <p className="text-text-muted text-sm">No playlists published yet.</p>;
  }

  return (
    <div className="w-full min-w-0">
      {cards.map((item) => (
        <PlaylistCard key={item.trackId} {...item} />
      ))}
      <InfiniteScrollPagination
        hasMore={hasMore}
        isPaginating={isPaginating}
        sentinelRef={sentinelRef}
        loader={<PlaylistListFallback />}
        className="pt-3"
      />
    </div>
  );
}
