import { useState, useEffect } from 'react';
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
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
