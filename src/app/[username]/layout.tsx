import React from 'react';
import ProfileHeader from '@/components/ProfileHeader';
import ProfileNav from '@/components/ProfileNav';
import { IconButton } from '@/components/buttons/IconButton';
import { ShareIcon, EditIcon } from '@/components/icons/GenrealIcons';
import ProfileSideBar from '@/components/ProfileSideBar';

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
      <div className="flex flex-row-reverse items-center gap-18 mb-5 mr-10">
        <IconButton aria-label="edit">
          <span className="flex items-center bg-gray-800 rounded-md px-4 py-2 flex-shrink-0">
            <EditIcon /> edit
          </span>
        </IconButton>

        <IconButton aria-label="Share">
          <span className="flex items-center bg-gray-800 rounded-md px-4 py-2 flex-shrink-0">
            <ShareIcon /> share
          </span>
        </IconButton>
        <ProfileNav username={`${username}`} />
      </div>

      <div className="flex w-full mt-6 px-8">
        <div className="flex-1">{children}</div>
        <div className="w-[340px] ml-10">
          <ProfileSideBar
            countTracks={1001}
            countFollowers={99000}
            countFollowing={3200}
            bio="This is my bio."
            socialItems={[
              { label: 'Instagram', url: 'https://www.instagram.com' },
              { label: 'Twitter', url: 'https://www.twitter.com' },
              { label: 'Facebook', url: 'https://www.facebook.com' },
              { label: 'Decibel', url: 'https://www.decibel.foo' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;
