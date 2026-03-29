import StateItem from '@/features/prof/components/StatItem';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface StateItemProps {
  countTracks: number;
  countFollowers: number;
  countFollowing: number;
  username: string;
}

//this components displays three ocunter for tracks and follower and following and string text of choice and color
const StatsGroup = ({
  countTracks,
  countFollowers,
  countFollowing,
}: StateItemProps) => {
  const { username } = useParams<{ username: string }>();
  return (
    <div className="flex flex-nowrap gap-4">
      {/* there is no followers page implemented ????  */}
      <Link href={`/${username}/followers`}>
        <StateItem count={countFollowers} text="Followers" />
      </Link>
      <Link href={`/${username}/following`}>
        <StateItem count={countFollowing} text="Following" />
      </Link>
      <StateItem count={countTracks} text="Tracks" />
    </div>
  );
};

export default StatsGroup;
