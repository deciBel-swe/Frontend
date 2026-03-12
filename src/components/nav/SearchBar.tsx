'use client';

/**
 * SearchBar — controlled search form with a submit button.
 *
 * Owns its own `query` state internally, keeping the parent component
 * stateless. Calls `onSearch` with the current query on form submission.
 * The native browser search decoration and cancel button are suppressed
 * for a consistent cross-browser appearance.
 *
 * @example
 * <SearchBar
 *   onSearch={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
 * />
 */

import { useState, type FC, type FormEvent } from 'react';

import { SearchIcon } from '@/components/icons/NavIcons';
import { IconButton } from '@/components/buttons/IconButton';
export interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export const SearchBar: FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
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
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search"
        autoComplete="off"
        className="flex-1 min-w-0 h-full bg-transparent border-0 outline-none text-text-primary text-[13px] font-medium  px-3.5 placeholder:text-text-muted [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />

      <IconButton aria-label="search" className="mr-4">
        <SearchIcon />
      </IconButton>
    </form>
  );
};
