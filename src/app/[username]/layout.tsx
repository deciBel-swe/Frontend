import React from 'react';
import ProfileHeader from '@/features/prof/components/ProfileHeader';
import ProfileNav from '@/features/prof/components/ProfileNav';
import { IconButton } from '@/components/buttons/IconButton';
import { ShareIcon, EditIcon } from '@/components/icons/GenrealIcons';
import ProfileSideBar from '@/features/prof/components/ProfileSideBar';
import NavNControlBar from '@/features/prof/components/NavNControlBar';

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) => {
  const { username } = await params;

  return (
    <div>
      <div>
        <ProfileHeader username={`${username}`} />
      </div>
      <NavNControlBar username={`${username}`} />
      <div className="flex w-full mt-6 px-8">
        <div className="flex-1">{children}</div>
        <div className="w-[340px] ml-10">
          <ProfileSideBar username={`${username}`} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
