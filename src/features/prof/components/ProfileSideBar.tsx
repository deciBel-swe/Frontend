'use client';
import React from 'react';
import { SocialList } from './SocialList';
import StatsGroup from './StatsGroup';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';

interface ProfileSideBarProps {
  username: string;
}

const ProfileSideBar = ({ username }: ProfileSideBarProps) => {
  const { data } = usePublicUser(username);
  return (
    <div className="flex flex-col gap-2 p-5">
      <StatsGroup
        countTracks={data?.stats.trackCount || 0}
        countFollowers={data?.stats.followersCount || 0}
        countFollowing={data?.stats.followingCount || 0}
      />
      <p>{data?.profile.bio}</p>
      <SocialList items={data?.socialLinks} />
    </div>
  );
};

export default ProfileSideBar;
