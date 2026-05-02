/**
 * Utilities for browser navigation and URL management.
 */

/**
 * Redirects the browser to a new URL.
 * Extracted to a utility to allow for easier mocking in unit tests,
 * especially in JSDOM environments where window.location is protected.
 * 
 * @param {string} url - The destination URL
 */
export const navigateTo = (url: string): void => {
  if (typeof window !== 'undefined') {
    window.location.assign(url);
  }
};
