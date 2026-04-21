import type { ReactNode } from 'react';
import PageTabsLayout from '@/components/nav/PageTabsLayout';

const TABS = [
  { label: 'Overview',  href: '/you/library' },
  { label: 'Likes',     href: '/you/likes' },
  { label: 'Playlists', href: '/you/sets' },
  { label: 'Following', href: '/you/following' },
  { label: 'History',   href: '/you/history' },
];

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
 return (
    <PageTabsLayout tabs={TABS}>
      <div className="pt-4">{children}</div>
    </PageTabsLayout>
  );
}
