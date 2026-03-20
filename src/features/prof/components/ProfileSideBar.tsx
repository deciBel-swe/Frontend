'use client';
import React from 'react';
import { SocialList } from './SocialList';
import StatsGroup from './StatsGroup';
import { SocialItem } from '@/types/user';
import { useProfileSideBar } from '../useProfileSideBar';

interface ProfileSideBarProps {
  username: string;
}

const ProfileSideBar = ({ username }: ProfileSideBarProps) => {
  const { data, isLoading, error } = useProfileSideBar(username);
  return (
    <div className="flex flex-col gap-2 p-5">
      <StatsGroup
        countTracks={data?.countTracks || 0}
        countFollowers={data?.countFollowers || 0}
        countFollowing={data?.countFollowing || 0}
      />
      <p>{data?.bio}</p>
      <SocialList items={data?.socialItems} />
    </div>
  );
};

export default ProfileSideBar;
