import React from 'react';
import StatsGroup from '@/components/StatsGroup';
import ProfileHeader from '@/components/ProfileHeader';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <ProfileHeader
        params={Promise.resolve({
          coverPhotoUrl: 'https://i.ibb.co/604S7P6G/sl-063022-51250-12.jpg',
          avatarUrl: 'https://i.ibb.co/yB5VBGsN/fern.jpg',
        })}
      />
      <div className="flex w-full mt-6 px-8">
        <div className="flex-1">{children}</div>

        <div className="w-[340px] ml-10">
          <div className="flex flex-col gap-2 p-5">
            <StatsGroup
              params={Promise.resolve({
                countTracks: 1001,
                countFollowers: 99000,
                countFollowing: 3200,
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
