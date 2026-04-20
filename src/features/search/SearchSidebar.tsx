'use client';
import ScrollableArea from "@/components/scroll/ScrollableArea";
import TabFilters from "./TabFilters";
import { useSearchNavigation } from "./hooks/useSearchNavigation";

/**
 * SearchSidebar — stateless tab navigation and dynamic filter panel for search results.
 *
 * This component provides the left sidebar navigation for the search feature, containing:
 * - Query display header (when a search query is present)
 * - Tab navigation for different search result types
 * - Dynamic filter controls based on the current tab
 *
 * ## Tab Navigation
 * - **Everything** → `/search` (combined results from all types)
 * - **Tracks** → `/search/sounds` (individual tracks)
 * - **People** → `/search/people` (user profiles)
 * - **Albums** → `/search/albums` (album collections)
 * - **Playlists** → `/search/sets` (user-created playlists)
 *
 * ## Query Display
 * When a search query (`q` parameter) is present, displays "Search results for 'query'"
 * at the top of the sidebar with proper typography and word-breaking.
 *
 * ## Dynamic Filters
 * Filter sections adapt based on the current tab:
 * - **Tracks**: Date added (collapsible), length (collapsible), genre tags
 * - **Albums/Playlists**: Genre tags only
 * - **People**: Location guidance note (filters populated by search results)
 * - **Everything**: No filters (shows combined results)
 *
 * ## Filter UI Patterns
 * - **Collapsible filters**: Date/length use expandable sections with active state display
 * - **Genre tags**: Clickable pill-style buttons with active/inactive states
 * - **Active states**: Clear visual distinction using theme-aware colors
 *
 * @example
 * ```tsx
 * // Used internally by SearchPage component - no direct usage needed
 * <SearchSidebar />
 * ```
 *
 * The component automatically handles all navigation and filtering through
 * the `useSearchNavigation` hook, making it a pure presentation component.
 */

export type SearchTab = 'everything' | 'tracks' | 'people' | 'albums' | 'playlists';

// ── Tab definitions ──────────────────────────────────────────────────────────

const TABS: { id: SearchTab; label: string }[] = [
  { id: 'everything', label: 'Everything' },
  { id: 'tracks',     label: 'Tracks'     },
  { id: 'people',     label: 'People'     },
  { id: 'playlists',  label: 'Playlists'  },
];

// ── Main component ───────────────────────────────────────────────────────────


export default function SearchSidebar() {
  const {
    query,
    currentTab,
    activeFilters,
    handleTabChange,
    handleFilterChange,
  } = useSearchNavigation();
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
                onClick={() => handleTabChange(id)}
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
                onFilterChange={handleFilterChange}
            />
        </div>
        </nav>
    </ScrollableArea>
  );
}