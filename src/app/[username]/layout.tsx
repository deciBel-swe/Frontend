import React from 'react';
import ProfileHeader from '@/features/prof/components/ProfileHeader';
import ProfileSideBar from '@/features/prof/components/ProfileSideBar';
import { IconButton } from '@/components/buttons/IconButton';
import { ShareIcon, EditIcon } from '@/components/icons/GenrealIcons';
import ProfileNav from '@/features/prof/components/ProfileNav';

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
      <div className="flex flex-row-reverse items-center gap-18 mb-5 mr-10">
        <IconButton aria-label="edit">
          <span className="flex items-center bg-gray-300 rounded-md px-4 py-2 flex-shrink-0 dark:bg-gray-700">
            <EditIcon /> edit
          </span>
        </IconButton>

        <IconButton aria-label="Share">
          <span className="flex items-center bg-gray-300 rounded-md px-4 py-2 flex-shrink-0 dark:bg-gray-700">
            <ShareIcon /> share
          </span>
        </IconButton>
        <ProfileNav username={`${username}`} />
      </div>
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
