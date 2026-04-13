'use client';

/**
 * DiscoverPage
 *
 * Orchestrator: decides WHICH sections to render based on auth state.
 * Does NOT own any data — all items arrive as props (Dependency Inversion).
 *
 * Auth gating:
 *   - Guest  → Trending only
 *   - Logged in → More of What You Liked, Recently Played,
 *                 More Based on Genre, More Based on Trending
 *
 * TODO: Replace `isLoggedIn` with real auth hook:
 *   const { isLoggedIn } = useAuth();
 *
 * TODO: Replace all mock-typed prop arrays with real data injected from hooks:
 *   const { tracks: likedTracks }    = useLikedTracks();
 *   const { tracks: recentTracks }   = useListeningHistoryTracks();
 *   const { tracks: trendingTracks } = useTrendingTracks();
 *   const { tracks: genreTracks }    = useGenreTracks();
 */

import MinimalTrackCard from '@/components/tracks/MinimalTrackCard';
import MinimalPlaylistCard from '@/components/playlist/MinimalPlaylistCard';
import DiscoverSection from '@/features/discover/DiscoverSection';
import type { DiscoverTrackItem, DiscoverPlaylistItem } from '@/features/discover/types/DiscoverTypes';

type DiscoverPageProps = {
  /** TODO: replace with useAuth() */
  isLoggedIn: boolean;

  // ── Guest ──────────────────────────────────────────────────────────────────
  /** TODO: connect to service layer — useTrendingTracks() */
  trendingTracks: DiscoverTrackItem[];

  // ── Authenticated ──────────────────────────────────────────────────────────
  /** TODO: connect to service layer — useLikedTracks() */
  likedTracks?: DiscoverTrackItem[];

  /** TODO: connect to service layer — useListeningHistoryTracks() */
  recentlyPlayedItems?: (DiscoverTrackItem | DiscoverPlaylistItem)[];

  /** TODO: connect to service layer — useGenreTracks() */
  genreTracks?: DiscoverTrackItem[];

  /** TODO: connect to service layer — useTrendingTracks() (may share with trendingTracks) */
  moreTrendingTracks?: DiscoverTrackItem[];

  // ── Loading flags (wire up once hooks are connected) ──────────────────────
  /** TODO: set to useLikedTracks().isLoading */
  isLoadingLiked?: boolean;
  /** TODO: set to useListeningHistoryTracks().isLoading */
  isLoadingRecent?: boolean;
  /** TODO: set to useTrendingTracks().isLoading */
  isLoadingTrending?: boolean;
  /** TODO: set to useGenreTracks().isLoading */
  isLoadingGenre?: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Type-guard: is this item a playlist or a track? */
function isPlaylistItem(
  item: DiscoverTrackItem | DiscoverPlaylistItem,
): item is DiscoverPlaylistItem {
  return 'coverUrl' in item;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DiscoverPage({
  isLoggedIn,
  trendingTracks,
  likedTracks = [],
  recentlyPlayedItems = [],
  genreTracks = [],
  moreTrendingTracks = [],
  isLoadingLiked = false,
  isLoadingRecent = false,
  isLoadingTrending = false,
  isLoadingGenre = false,
}: DiscoverPageProps) {
  // ── Guest view ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="w-full">
        <DiscoverSection<DiscoverTrackItem>
          title={isLoadingTrending ? "" : "Trending "}
          items={trendingTracks}
          isLoading={isLoadingTrending}
          renderItem={(discoverItem, index) => (
            <MinimalTrackCard
              key={`trending-${discoverItem.item.track.id}-${index}`}
              item={discoverItem.item}
              queueTracks={discoverItem.queueTracks}
              queueSource={discoverItem.queueSource ?? 'likes'}
            />
          )}
        />
      </div>
    );
  }

  // ── Authenticated view ─────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* 1. More of What You Liked */}
      <DiscoverSection<DiscoverTrackItem>
        title="More of what you like"
        items={likedTracks}
        isLoading={isLoadingLiked}
        renderItem={(discoverItem, index) => (
          <MinimalTrackCard
            key={`liked-${discoverItem.item.track.id}-${index}`}
            item={discoverItem.item}
            queueTracks={discoverItem.queueTracks}
            queueSource={discoverItem.queueSource ?? 'likes'}
          />
        )}
      />

      {/* 2. Recently Played — supports both tracks and playlists */}
      <DiscoverSection<DiscoverTrackItem | DiscoverPlaylistItem>
        title="Recently played"
        items={recentlyPlayedItems}
        isLoading={isLoadingRecent}
        renderItem={(item, index) => {
          if (isPlaylistItem(item)) {
            return (
              <MinimalPlaylistCard
                key={`recent-playlist-${item.id}-${index}`}
                title={item.title}
                coverUrl={item.coverUrl}
                username={item.username}
                sets={item.sets}
              />
            );
          }

          return (
            <MinimalTrackCard
              key={`recent-track-${item.item.track.id}-${index}`}
              item={item.item}
              queueTracks={item.queueTracks}
              queueSource={item.queueSource ?? 'likes'}
            />
          );
        }}
      />

      {/* 3. More Based on Genre */}
      <DiscoverSection<DiscoverTrackItem>
        title="More based on genre"
        items={genreTracks}
        isLoading={isLoadingGenre}
        renderItem={(discoverItem, index) => (
          <MinimalTrackCard
            key={`genre-${discoverItem.item.track.id}-${index}`}
            item={discoverItem.item}
            queueTracks={discoverItem.queueTracks}
            queueSource={discoverItem.queueSource ?? 'likes'}
          />
        )}
      />

      {/* 4. More Based on Trending */}
      <DiscoverSection<DiscoverTrackItem>
        title="More based on trending"
        items={moreTrendingTracks}
        isLoading={isLoadingTrending}
        renderItem={(discoverItem, index) => (
          <MinimalTrackCard
            key={`trending-more-${discoverItem.item.track.id}-${index}`}
            item={discoverItem.item}
            queueTracks={discoverItem.queueTracks}
            queueSource={discoverItem.queueSource ?? 'likes'}
          />
        )}
      />
    </div>
  );
}