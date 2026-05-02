'use client';


import type { ReactNode } from 'react';
import PageTabsLayout from '@/components/nav/PageTabsLayout';

const TABS = [
  { label: 'Account', href: '/settings/' },
  { label: 'Notifications', href: '/settings/notifications' },
  { label: 'Privacy', href: '/settings/privacy' },
  { label: 'Subscription', href: '/settings/subscription' },
];

export default function Layout({ children }: { children: ReactNode }) {
  return <PageTabsLayout title="Settings" tabs={TABS}>{children}</PageTabsLayout>;
}
