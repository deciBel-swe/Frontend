/**
 * Custom Hooks Barrel Export
 */

/**
 * useDebounce — debounces a value by the given delay (default 500 ms).
 * Useful for deferring search queries and API calls until the user stops typing.
 *
 * @example
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Perform search API call
 *     }
 *   }, [debouncedSearchTerm]);
 */
export { useDebounce } from './useDebounce';

/**
 * useTheme — re-exported from next-themes.
 * Provides `theme`, `setTheme`, `resolvedTheme`, and `systemTheme`.
 *
 * Must be used inside a component rendered under <ThemeProvider>.
 *
 * @example
 *   const { theme, setTheme } = useTheme();
 *   <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
 *     Toggle
 *   </button>
 */
export { useTheme } from 'next-themes';

// Additional hooks will be exported here as they are created
// Example:
// export { useAuth } from './useAuth';
// export { usePlayer } from './usePlayer';
// export { useIntersectionObserver } from './useIntersectionObserver';
