import StateItem from '@/components/StatItem';
interface StateItemProps {
  params: Promise<{
    countCustom: number;
    countFollowers: number;
    countFollowing: number;
    text: string;
    color?: string;
  }>;
}

//this components displays three ocunter for tracks and follower and following and string text of choice and color
const StatsGroup = async ({ params }: StateItemProps) => {
  const { countCustom, countFollowers, countFollowing, text, color } =
    await params;

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
          color: color,
        })}
      />
      <StateItem
        params={Promise.resolve({
          count: countFollowing,
          text: 'Following',
          color: color,
        })}
      />
      <StateItem
        params={Promise.resolve({
          count: countCustom,
          text: text,
          color: color,
        })}
      />
    </div>
  );
};

export default StatsGroup;
