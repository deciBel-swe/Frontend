'use client';

import PageTabsLayout from '@/components/nav/PageTabsLayout';

interface ProfileNavProps {
  username: string;
}

const getNavItems = (username: string) => [
  { label: 'All', href: `/${username}` },
  { label: 'Popular tracks', href: `/${username}/popular-tracks` },
  { label: 'Tracks', href: `/${username}/tracks` },
  { label: 'Albums', href: `/${username}/albums` },
  { label: 'Playlists', href: `/${username}/sets` },
  { label: 'Reposts', href: `/${username}/reposts` },
];

export default function ProfileNav({ username }: ProfileNavProps) {
return <PageTabsLayout tabs={getNavItems(username)} size="sm"> </PageTabsLayout>;
}