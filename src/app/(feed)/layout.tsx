import type { ReactNode } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  // return <>{children}</>;
  return (
    <div className="w-full">
      <div className="flex w-full gap-6 items-start mt-6">
        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* SIDEBAR */}
        <aside className="hidden lg:block w-85 shrink-0 min-w-0 mt-3">
          <Sidebar
            History_header="Listening history"
            Artist_header="Artists you should follow"
          />
        </aside>
      </div>
    </div>

  );
}
