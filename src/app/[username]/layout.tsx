import React from 'react';
import StatsGroup from '@/components/StatsGroup';
import ProfileHeader from '@/components/ProfileHeader';
import ProfileNav from '@/components/ProfileNav';

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
      <div style={{ marginBottom: '32px' }}>
        <ProfileHeader
          params={Promise.resolve({
            coverPhotoUrl: 'https://i.ibb.co/r2ZssgJZ/sl-063022-51250-12.jpg',
            avatarUrl: 'https://i.ibb.co/yFSZ1q4g/images.webp',
            username: `${username}`,
          })}
        />
      </div>
      <div className="flex w-full mt-6 px-8">
        <div className="flex-1" style={{ marginLeft: '32px' }}>
          <ProfileNav username={`${username}`} />
          {children}
        </div>
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

export default Layout;
