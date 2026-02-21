/**
 * Custom Hook: useDebounce
 * 
 * Debounces a value, useful for search inputs and API calls.
 * 
 * @example
 * const SearchComponent = () => {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Perform search API call
 *     }
 *   }, [debouncedSearchTerm]);
 * 
 *   return <input onChange={(e) => setSearchTerm(e.target.value)} />;
 * };
 */

import { useState, useEffect } from 'react';

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
