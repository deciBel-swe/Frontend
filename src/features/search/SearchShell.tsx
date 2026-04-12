'use client';

/**
 * SearchShell — pure layout shell.
 *
 * Responsibilities (only these):
 *   1. Render the two-column layout (sidebar + main content).
 *   2. Forward sidebar props and content to the right slots.
 *
 * @example
 * // In /search/sounds/page.tsx
 * <SearchShell
 *   sidebar={<SearchSidebar ... />}
 *   content={<SearchResults tab="tracks" ... />}
 * />
 */

import type { ReactNode } from 'react';

interface SearchShellProps {
  /** The left sidebar slot — typically <SearchSidebar /> */
  sidebar: ReactNode;
  /** The main content slot — typically <SearchResults /> */
  content: ReactNode;
}

export default function SearchShell({ sidebar, content }: SearchShellProps) {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3rem)] mt-12 bg-bg-base">
      <aside className="w-full lg:w-[220px] xl:w-[260px] shrink-0 pt-8 pb-8 lg:sticky lg:top-12 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        {sidebar}
      </aside>

      <main className="flex-1 min-w-0 px-4 lg:px-8 pt-8 pb-16">
        {content}
      </main>
    </div>
  );
}