import StateItem from '@/components/StatItem';
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
        flexWrap: 'wrap',
      }}
    >
      <StateItem
        params={Promise.resolve({
          count: countFollowers,
          text: 'Followers',
        })}
      />
      <StateItem
        params={Promise.resolve({
          count: countFollowing,
          text: 'Following',
        })}
      />
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
