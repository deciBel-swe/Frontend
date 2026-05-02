'use client';

/**
 * SearchBar — controlled search form with a submit button.
 *
 * Owns its own `query` state internally, keeping the parent component
 * stateless. Calls `onSearch` with the current query on form submission.
 * The native browser search decoration and cancel button are suppressed
 * for a consistent cross-browser appearance.
 *
 * When `onSearch` is not provided the component falls back to pushing
 * `/search?q={query}` via Next.js router — so dropping it in the navbar
 * just works with no extra wiring needed.
 *
 * @example
 * // Navbar usage — routing handled internally, no prop needed
 * <SearchBar />
 *
 * // Original usage with explicit handler
 * <SearchBar
 *   onSearch={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
 * />
 *
 * // Pre-fill the input when already on the search page
 * <SearchBar defaultValue={searchParams.get('q') ?? ''} />
 */

import { useState, type FC, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from '@/components/icons/NavIcons';
// import { IconButton } from '@/components/buttons/IconButton';

export interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  /** Pre-fill the input, e.g. when already on the search page */
  defaultValue?: string;
}

export const SearchBar: FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search',
  defaultValue = '',
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="w-full max-w-full max-h-9 mt-1.5 flex items-center bg-interactive-default border border-transparent rounded-[3px] focus-within:border-interactive-active transition-[border-color] duration-150"
    >
      <input
        type="search"
        name="q"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search"
        autoComplete="off"
        className="flex-1 min-w-0 h-full bg-transparent border-0 outline-none text-text-primary text-[13px] font-medium px-3.5 placeholder:text-text-muted [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />
      <button aria-label="Submit search" className="mr-4" type="submit">
        <SearchIcon />
      </button>
    </form>
  );
};