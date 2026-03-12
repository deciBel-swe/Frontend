import React from 'react';
import StatsGroup from '@/components/StatsGroup';
import ProfileBanner from '@/components/ProfileBanner';
import ProfileAvatar from '@/components/ProfileAvatar';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <ProfileBanner
        params={Promise.resolve({
          coverPhotoUrl: 'https://i.ibb.co/604S7P6G/sl-063022-51250-12.jpg"',
        })}
      />
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '20px',
          zIndex: 1000,
        }}
      >
        <ProfileAvatar
          params={Promise.resolve({
            avatarUrl: 'https://i.ibb.co/yB5VBGsN/fern.jpg',
          })}
        />
        <h1>username</h1>
        <StatsGroup
          params={Promise.resolve({
            countTracks: 1001,
            countFollowers: 99000,
            countFollowing: 3200,
          })}
        />
      </div>
      {children}
    </div>
  );
};

export default layout;
