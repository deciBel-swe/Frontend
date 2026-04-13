'use client';

import { useAuth } from '@/features/auth/useAuth';
/**
 * src/app/page.tsx  —  Home / Discover entry point
 *
 * DEV MODE: Mock data is wired in. Flip `MOCK_IS_LOGGED_IN` to test both views.
 *
 * TODO: Replace mock imports + constants with real hooks once service layer is ready:
 *   import { useAuth }                   from '@/features/auth/hooks/useAuth';
 *   import { useLikedTracks }            from '@/hooks/useLikedTracks';
 *   import { useListeningHistoryTracks } from '@/hooks/useListeningHistoryTracks';
 *   import { useTrendingTracks }         from '@/hooks/useTrendingTracks';
 *   import { useGenreTracks }            from '@/hooks/useGenreTracks';
 */

import DiscoverPage from '@/features/discover/DiscoverPage';
import {
  mockTrendingTracks,
  mockLikedTracks,
  mockRecentlyPlayedItems,
  mockGenreTracks,
  mockMoreTrendingTracks,
} from '@/features/discover/mock/MockDiscoverData';
import { useEffect, useState } from 'react';

// ─── DEV TOGGLE ──────────────────────────────────────────────────────────────
// Set to `true` to preview the authenticated view, `false` for the guest view.
// const MOCK_IS_LOGGED_IN = true;
// ─────────────────────────────────────────────────────────────────────────────

export default function Page() {
  // ── Auth ─────────────────────────────────────────────────────────────────
  // TODO: replace with → const { isLoggedIn } = useAuth();
  // const isLoggedIn = MOCK_IS_LOGGED_IN;
  const { isAuthenticated, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
 
  useEffect(() => { setIsMounted(true); }, []);
  // ── Data ─────────────────────────────────────────────────────────────────
  // TODO: replace each mock* value with the corresponding hook result:
  //   const { tracks: trendingTracks,  isLoading: isLoadingTrending } = useTrendingTracks();
  //   const { tracks: likedTracks,     isLoading: isLoadingLiked    } = useLikedTracks();
  //   const { items:  recentItems,     isLoading: isLoadingRecent   } = useListeningHistoryTracks();
  //   const { tracks: genreTracks,     isLoading: isLoadingGenre    } = useGenreTracks();
  //   const { tracks: moreTrending }                                   = useTrendingTracks({ offset: 10 });

  return (
    <DiscoverPage
      isLoggedIn={isMounted ? isAuthenticated : false}
      trendingTracks={!isMounted || isLoading ? [] : mockTrendingTracks}
      likedTracks={!isMounted || isLoading ? [] : mockLikedTracks}
      recentlyPlayedItems={!isMounted || isLoading ? [] : mockRecentlyPlayedItems}
      genreTracks={!isMounted || isLoading ? [] : mockGenreTracks}
      moreTrendingTracks={!isMounted || isLoading ? [] : mockMoreTrendingTracks}
      // All loading flags off — mock data is synchronous
      isLoadingTrending={!isMounted || isLoading }
      isLoadingLiked={!isMounted || isLoading }
      isLoadingRecent={!isMounted || isLoading }
      isLoadingGenre={!isMounted || isLoading }
    />
  );
}