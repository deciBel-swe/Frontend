'use client';

/**
 * SearchPage — the reusable composed search page for any tab.
 *
 * Each route page (e.g. /search/sounds) uses this component and passes:
 *   - `tab`       which tab is active on this route
 *   - `tracks`    resolved data (from your data hook, SWR, React Query, etc.)
 *   - `playlists`
 *   - `people`
 *   - `isLoading`
 *   - `totals`    optional result counts
 *
 * This component is NOT a god component — it only composes:
 *   SearchShell + SearchSidebar + SearchResults
 * It delegates URL logic to useSearchNavigation.
 *
 * To add a new tab: create a new page file, pass `tab="newTab"`.
 * You never touch this file (Open/Closed Principle).
 *
 * @example
 * // /search/sounds/page.tsx
 * export default function TracksPage() {
 *   const { tracks, isLoading } = useTrackSearch();
 *   return <SearchPage tab="tracks" tracks={tracks} isLoading={isLoading} />;
 * }
 */

import SearchShell from '@/features/search/SearchShell';
import SearchSidebar from '@/features/search/SearchSidebar';
import SearchResults from '@/features/search/SearchResults';
import { useSearchNavigation } from '@/features/search/hooks/useSearchNavigation';
import type { SearchTab } from '@/features/search/SearchSidebar';
import type { TrackCardProps } from '@/components/tracks/track-card';
import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import type { UserCardData } from '@/features/social/components/UserCard';

interface SearchPageProps {
  tab: SearchTab;
  tracks?: TrackCardProps[];
  playlists?: PlaylistHorizontalProps[];
  people?: UserCardData[];
  totalTracks?: number;
  totalPlaylists?: number;
  totalPeople?: number;
  isLoading?: boolean;
}

export default function SearchPage({
  tab,
  tracks = [],
  playlists = [],
  people = [],
  totalTracks,
  totalPlaylists,
  totalPeople,
  isLoading,
}: SearchPageProps) {
  const {
    query,
    currentTab,
    activeFilters,
    handleTabChange,
    handleFilterChange,
  } = useSearchNavigation(tab);

  return (
    <SearchShell
      sidebar={
        <SearchSidebar
          currentTab={currentTab}
          query={query}
          onTabChange={handleTabChange}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
      }
      content={
        query ? (
          <SearchResults
            tab={currentTab}
            query={query}
            tracks={tracks}
            playlists={playlists}
            people={people}
            totalTracks={totalTracks}
            totalPlaylists={totalPlaylists}
            totalPeople={totalPeople}
            isLoading={isLoading}
          />
        ) : (
          <p className="text-sm text-text-muted pt-8">
            Start typing to search for tracks, playlists, or people.
          </p>
        )
      }
    />
  );
}