'use client';

import { useParams, usePathname } from 'next/navigation';
import PageTabsLayout from '@/components/ui/PageTabsLayout';
import SocialPageHeader, { ListType } from '@/components/ui/social/SocialPageHeader';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';

const getTabs = (username: string) => [
  { label: 'Likes',     href: `/${username}/likes`      },
  { label: 'Following', href: `/${username}/following`   },
  { label: 'Followers', href: `/${username}/followers`   },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { username } = useParams<{ username: string }>();
  const pathname = usePathname();
  const { data: profileData } = usePublicUser(username);

  const listType: ListType =
    pathname.endsWith('/followers') ? 'followers' :
    pathname.endsWith('/likes')     ? 'likes'     :
    'following';

  return (
    <div className="max-w-[1180px] mx-auto px-6 pt-8 pb-16">
      {/* Header — "Followers of X" or "X is following" */}
      <SocialPageHeader 
        profileUsername={username}
        profileAvatarSrc={profileData?.profile.avatarUrl}
        listType={listType} />

      {/* Tabs — Likes | Following | Followers */}
      <PageTabsLayout tabs={getTabs(username)} size='sm'>
        {children}
      </PageTabsLayout>
    </div>
  );
}