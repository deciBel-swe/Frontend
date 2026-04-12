'use client';
import ScrollableArea from "@/components/scroll/ScrollableArea";
import TabFilters from "./TabFilters";
/**
 * SearchSidebar — stateless tab navigation and dynamic filter panel.
 *
 * Owns no state itself; all selections are communicated upward via callbacks
 * so the parent can persist them in the URL and render the tab on its
 * dedicated route.
 *
 * Tab navigation mirrors SoundCloud-like route structure:
 *   Everything  → /search
 *   Tracks      → /search/sounds
 *   People      → /search/people
 *   Albums      → /search/albums
 *   Playlists   → /search/sets
 *
 * When `q` is present the selected query is shown at the top of the sidebar.
 * The "Filter by" section is fully dynamic, and filter buttons render as
 * clickable tag-style pills.
 *
 *   - `tracks`            → genre + date added + length
 *   - `albums`/`playlists`→ genre only
 *   - `people`            → location note (populated by search results)
 *   - `everything`        → no filters
 *
 * @example
 * <SearchSidebar
 *   currentTab="tracks"
 *   query="xxxx"
 *   onTabChange={(tab) => router.push(TAB_TO_PATH[tab] + '?q=xxxx')}
 *   activeFilters={{ genre: 'electronic' }}
 *   onFilterChange={(key, value) => router.push(buildUrl({ [key]: value }))}
 * />
 */

export type SearchTab = 'everything' | 'tracks' | 'people' | 'albums' | 'playlists';

interface SearchSidebarProps {
  currentTab: SearchTab;
  query?: string;
  onTabChange: (tab: SearchTab) => void;
  /** Active filter values per category, e.g. { genre: 'Electronic' } */
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
}

// ── Tab definitions ──────────────────────────────────────────────────────────

const TABS: { id: SearchTab; label: string }[] = [
  { id: 'everything', label: 'Everything' },
  { id: 'tracks',     label: 'Tracks'     },
  { id: 'people',     label: 'People'     },
  { id: 'albums',     label: 'Albums'     },
  { id: 'playlists',  label: 'Playlists'  },
];

// ── Main component ───────────────────────────────────────────────────────────

export default function SearchSidebar({
  currentTab,
  query,
  onTabChange,
  activeFilters,
  onFilterChange,
}: SearchSidebarProps) {
  return (
    <ScrollableArea>
        <nav className="flex flex-col w-full" aria-label="Search navigation">
        {query ? (
            <div className="mb-6 px-1">
            <p className="text-xl font-bold text-text-primary break-words mb-1">
                Search results for <span>&ldquo;{query}&rdquo;</span>
            </p>
            {/* <p className="text-base font-bold text-text-primary break-words">
                &ldquo;{query}&rdquo;
            </p> */}
            </div>
        ) : null}

        {/* Tab list */}
        <ul className="flex flex-col gap-0.5 pr-8">
            {TABS.map(({ id, label }) => (
            <li key={id}>
                <button
                onClick={() => onTabChange(id)}
                aria-current={currentTab === id ? 'page' : undefined}
                className={`w-full text-left text-sm px-3 py-2 rounded transition-colors duration-100 font-medium
                    ${currentTab === id
                    ? 'bg-neutral-900 text-neutral-0 dark:bg-neutral-0 dark:text-neutral-900'
                    : 'text-text-secondary hover:text-text-primary hover:bg-interactive-default'
                    }`}
                >
                {label}
                </button>
            </li>
            ))}
        </ul>

        {/* Dynamic filters */}
        <div className="mt-4 pr-8">
            <TabFilters
                tab={currentTab}
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
            />
        </div>
        </nav>
    </ScrollableArea>
  );
}