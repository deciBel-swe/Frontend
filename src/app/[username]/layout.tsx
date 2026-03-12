import React from 'react';
import StatsGroup from '@/components/StatsGroup';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
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
