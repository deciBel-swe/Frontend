import type { ReactNode } from 'react';
import PageTabsLayout from '@/components/nav/PageTabsLayout';

const TABS = [
  { label: 'Analytics',  href: '/admin/analytics' },
  { label: 'Reports',     href: '/admin/reports' },
  { label: 'Users', href: '/admin/users' },
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
