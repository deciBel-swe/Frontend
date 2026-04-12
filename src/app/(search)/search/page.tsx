'use client';

/**
 * Search Page — /search
 *
 * Owns all URL-driven state. Reads `q` (search query) and tab-specific filter
 * params from `useSearchParams`, and resolves the active tab from
 * `usePathname`. All state mutations are expressed as `router.push` calls so
 * the browser history and URL stay in sync — the page is fully shareable and
 * bookmarkable.
 *
 * URL patterns (mirrors SoundCloud):
 *   /search?q=term              → Everything tab
 *   /search/sounds?q=term       → Tracks tab
 *   /search/people?q=term       → People tab
 *   /search/albums?q=term       → Albums tab
 *   /search/sets?q=term         → Playlists tab
 *
 * Filter params are appended to the existing query string, e.g.:
 *   /search/tracks?q=ijk&genre=electronic&length=short
 *
 * Layout:
 *   Mobile  → sidebar stacks above main content (flex-col)
 *   Desktop → sidebar fixed-width left column, content fills remainder (flex-row)
 *
 * Data fetching:
 *   The three `[]` arrays are intentional placeholders. Replace them with
 *   your data hooks (useSWR / React Query) keyed on `query`, `currentTab`,
 *   and `activeFilters`. Pass `isLoading` to `SearchResults` to show skeletons.
 */

import SearchShell from '@/features/search/SearchShell';

export default function Page() {
  return <SearchShell tab="everything" />;
}
