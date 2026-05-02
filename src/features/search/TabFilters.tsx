'use client';

// import { useState } from 'react';
import { GENRE_OPTIONS} from './constants/FilterData';

/**
 * TabFilters — renders the tab-specific filter sections for search.
 *
 *   Genre tags    → `# Tag` bordered pills, no fill. Active state: black border
 *                   + black text (light) / white (dark). Clicking again clears.
 *
 * The active tab determines which filters are shown:
 *   - `tracks`               → date collapsible + length collapsible + genre pills
 *   - `playlists` → genre pills only
 *   - `people`               → location guidance note
 *   - `everything`           → no filters
 */

export type SearchTab = 'everything' | 'tracks' | 'people' | 'playlists';

// interface FilterOption {
//   label: string;
//   value: string;
// }

// ── CollapsibleFilter ───────────────────────────────────────────────────────────

/**
 * CollapsibleFilter — a single collapsible filter group.
 *
 * The header always shows the currently selected option's label (falling back
 * to the first option's label, e.g. "Added any time"). Clicking the header
 * toggles the list. Selecting an option closes the list and fires
 * `onFilterChange`. Clicking the already-active option clears the filter.
 */
// function CollapsibleFilter({
//   options,
//   filterKey,
//   activeValue,
//   onFilterChange,
// }: {
//   options: FilterOption[];
//   filterKey: string;
//   activeValue?: string;
//   onFilterChange?: (key: string, value: string) => void;
// }) {
//   const [open, setOpen] = useState(false);

//   // The header label is the currently selected option, or the first option
//   // as the default label (e.g. "Added any time" / "Any length")
//   const selectedOption = options.find((o) => o.value === activeValue) ?? options[0];

//   const handleSelect = (opt: FilterOption) => {
//     const isActive = activeValue === opt.value;
//     // Clicking active clears; clicking inactive sets
//     onFilterChange?.(filterKey, isActive ? '' : opt.value);
//     setOpen(false);
//   };

//   return (
//     <div className="px-1 pl-2">
//       {/* Collapsible header — shows selected label, toggles list */}
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         className="w-full text-left text-sm text-text-primary font-medium py-1.5 hover:text-text-secondary transition-colors duration-100"
//       >
//         {selectedOption.label}
//       </button>

//       {/* Expandable sub-list */}
//       {open && (
//         <ul className="flex flex-col mt-1 mb-2">
//           {options.map((opt) => {
//             const isActive = activeValue === opt.value;
//             return (
//               <li key={opt.value}>
//                 <button
//                   type="button"
//                   onClick={() => handleSelect(opt)}
//                   className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors duration-100
//                     ${isActive
//                       ? 'bg-neutral-900 text-neutral-0 dark:bg-neutral-0 dark:text-neutral-900 font-medium'
//                       : 'text-text-secondary hover:text-text-primary'
//                     }`}
//                 >
//                   {opt.label}
//                 </button>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </div>
//   );
// }

// ── GenreSection ──────────────────────────────────────────────────────────────

/**
 * GenreSection — `# Tag` bordered pills. No fill at any state.
 * Active pill: `border-border-contrast` + `text-text-primary`.
 * Clicking active clears the filter.
 */
function GenreSection({
  activeValue,
  onFilterChange,
}: {
  activeValue?: string;
  onFilterChange?: (key: string, value: string) => void;
}) {
  return (
    <div className="mt-5 px-1">
      <p className="text-medium font-bold mb-3">
        Filter by tag
      </p>
      <div className="flex flex-wrap gap-2 ">
        {GENRE_OPTIONS.map((opt) => {
          const isActive = activeValue === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFilterChange?.('genre', isActive ? '' : opt.value)}
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-100 border
                ${isActive
                  ? 'border-border-contrast text-text-primary bg-transparent'
                  : 'border-border-strong text-text-secondary hover:border-border-contrast hover:text-text-primary bg-transparent'
                }`}
            >
              # {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function TabFilters({
  tab,
  activeFilters = {},
  onFilterChange,
}: {
  tab: SearchTab;
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
}) {
  switch (tab) {
    case 'tracks':
      return (
        <div className="mt-5 flex flex-col gap-1">
          {/* <p className="text-medium font-bold px-1 mb-1">
            Filter results
          </p> */}
          {/* <CollapsibleFilter
            options={DATE_OPTIONS}
            filterKey="date"
            activeValue={activeFilters.date}
            onFilterChange={onFilterChange}
          />
          <CollapsibleFilter
            options={LENGTH_OPTIONS}
            filterKey="length"
            activeValue={activeFilters.length}
            onFilterChange={onFilterChange}
          /> */}
          <GenreSection
            activeValue={activeFilters.genre}
            onFilterChange={onFilterChange}
          />
        </div>
      );

    case 'playlists':
      return (
        <GenreSection
          activeValue={activeFilters.genre}
          onFilterChange={onFilterChange}
        />
      );

    // case 'people':
    //   return (
    //     <div className="mt-5 px-1">
    //       <p className="text-medium font-bold  mb-2">
    //         Filter by location
    //       </p>
    //       <p className="text-xs text-text-muted">
    //         Location filters are driven by search results.
    //       </p>
    //     </div>
    //   );

    case 'everything':
    default:
      return null;
  }
}