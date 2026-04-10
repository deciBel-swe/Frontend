'use client';

//import React, { useEffect, useState } from 'react';
import { SocialList } from '../../SocialList';
import StatsGroup from './StatsGroup';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import ListOfTrackRows from '@/components/sidebar/ListOfTrackRows';
import { useProfileSidebar } from '@/hooks/useProfileSidebar';

interface ProfileSideBarProps {
  username: string;
}
const ProfileSideBar = ({ username }: ProfileSideBarProps) => {
  const { data } = usePublicUser(username);
  const { likedRows, likesCount } = useProfileSidebar(username);

  return (
    <div className="w-full flex flex-col gap-6 text-sm">

      {/* TOP SECTION */}
      <div
        className="flex flex-col items-center gap-3 p-4 sm:p-5 bg-white dark:bg-[#121212] rounded-lg">
        <StatsGroup
          countTracks={data?.profile.trackCount || 0}
          countFollowers={data?.profile.followerCount || 0}
          countFollowing={data?.profile.followingCount || 0}
        />

        {data?.profile.bio && (
          <p className="w-full max-w-full overflow-hidden whitespace-pre-line text-center text-gray-600 dark:text-gray-300 text-xs sm:text-sm wrap-break-word">
            {data.profile.bio}
          </p>
        )}

        <div className="w-full flex justify-start">
          <SocialList items={data?.profile.socialLinksDto[0]} />
        </div>
      </div>

      {/* HISTORY */}
      <div
        className="bg-white dark:bg-[#121212] rounded-lg p-3 sm:p-4">
        <ListOfTrackRows
          headerUrl={`/${username}/likes`}
          History_header={`${likesCount} ${likesCount === 1 ? 'like' : 'likes'}`}
          history={likedRows}
          queueSource="likes"
        />
      </div>
    </div>
  );
};

export default ProfileSideBar;
