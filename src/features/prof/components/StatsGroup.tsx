import StateItem from '@/features/prof/components/StatItem';

import Link from 'next/link';

interface StateItemProps {
  params: Promise<{
    countTracks: number;
    countFollowers: number;
    countFollowing: number;
  }>;
}

//this components displays three ocunter for tracks and follower and following and string text of choice and color
const StatsGroup = async ({ params }: StateItemProps) => {
  const { countTracks, countFollowers, countFollowing } = await params;

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'nowrap',
      }}
    >
      <Link href="/you/following">
        <StateItem
          params={Promise.resolve({
            count: countFollowers,
            text: 'Followers',
          })}
        />
      </Link>
      <Link href="/you/followers">
        <StateItem
          params={Promise.resolve({
            count: countFollowing,
            text: 'Following',
          })}
        />
      </Link>
      <StateItem
        params={Promise.resolve({
          count: countTracks,
          text: 'Tracks',
        })}
      />
    </div>
  );
};

export default StatsGroup;
