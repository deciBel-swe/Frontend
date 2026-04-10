'use client';


import type { ReactNode } from 'react';
import PageTabsLayout from '@/components/nav/PageTabsLayout';

const TABS = [
  { label: 'Account', href: '/settings/' },
  { label: 'Content', href: '/settings/content' },
  { label: 'Notifications', href: '/settings/notifications' },
  { label: 'Privacy', href: '/settings/privacy' },
  { label: 'Advertising', href: '/settings/advertising' },
];

export default function Layout({ children }: { children: ReactNode }) {
  return <PageTabsLayout title="Settings" tabs={TABS}>{children}</PageTabsLayout>;
}
