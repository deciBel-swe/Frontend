import SearchSidebar from '@/features/search/SearchSidebar';
import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3rem)] mt-12 bg-bg-base">
      <aside className="w-full lg:w-[220px] xl:w-[260px] shrink-0 pt-8 pb-8 lg:sticky lg:top-12 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        <SearchSidebar />   {/* stays mounted across all /search/* routes */}
      </aside>
      <main className="flex-1 min-w-0 px-4 lg:px-8 pt-8 pb-16">
        {children}          {/* each page only renders its results here */}
      </main>
    </div>
  );
}

