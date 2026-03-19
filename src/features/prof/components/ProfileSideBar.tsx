import React from 'react';
import { SocialList } from './SocialList';
import StatsGroup from './StatsGroup';
import { SocialItem } from '@/types/socialItem';

interface ProfileSideBarProps {
  countTracks: number;
  countFollowers: number;
  countFollowing: number;
  bio: string;
  socialItems: SocialItem[];
}

const ProfileSideBar = ({
  countTracks,
  countFollowers,
  countFollowing,
  bio,
  socialItems,
}: ProfileSideBarProps) => {
  return (
    <div className="flex flex-col gap-2 p-5">
      <StatsGroup
        params={Promise.resolve({
          countTracks: 1001,
          countFollowers: 99000,
          countFollowing: 3200,
        })}
      />
      <p>bio</p>
      <SocialList items={socialItems} />
    </div>
  );
};

export default ProfileSideBar;
