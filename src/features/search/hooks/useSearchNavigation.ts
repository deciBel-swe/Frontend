'use client';

/**
 * useSearchNavigation — owns all URL-driven state for the search feature.
 *
 * Returns:
 *   - `query`         current `?q=` value
 *   - `activeFilters` current filter params (genre, date, length)
 *   - `handleTabChange`    navigate to the route for the given tab
 *   - `handleFilterChange` append/replace a filter param in the current URL
 */

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { SearchTab } from '@/features/search/SearchSidebar';

export const TAB_TO_PATH: Record<SearchTab, string> = {
  everything: '/search',
  tracks:     '/search/sounds',
  people:     '/search/people',
  albums:     '/search/albums',
  playlists:  '/search/sets',
};

export const PATH_TO_TAB: Record<string, SearchTab> = {
  '/search':        'everything',
  '/search/sounds': 'tracks',
  '/search/people': 'people',
  '/search/albums': 'albums',
  '/search/sets':   'playlists',
};

export function useSearchNavigation(overrideTab?: SearchTab) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const query      = searchParams.get('q') ?? '';
  const currentTab = overrideTab ?? PATH_TO_TAB[pathname] ?? 'everything';

  const buildUrl = useCallback(
    (path: string, params: Record<string, string>) => {
      const qs = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([k, v]) => {
        if (v) qs.set(k, v);
        else qs.delete(k);
      });
      return `${path}?${qs.toString()}`;
    },
    [searchParams],
  );

  const handleTabChange = useCallback(
    (tab: SearchTab) => router.push(buildUrl(TAB_TO_PATH[tab], {})),
    [router, buildUrl],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => router.push(buildUrl(pathname, { [key]: value })),
    [router, buildUrl, pathname],
  );

  const activeFilters: Record<string, string> = {
    genre:  searchParams.get('genre')  ?? '',
    date:   searchParams.get('date')   ?? '',
    length: searchParams.get('length') ?? '',
  };

  return {
    query,
    currentTab,
    activeFilters,
    handleTabChange,
    handleFilterChange,
  };
}