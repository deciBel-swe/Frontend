import StateItem from '@/features/prof/components/StatItem';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { count } from 'console';

interface StateItemProps {
  countTracks: number;
  countFollowers: number;
  countFollowing: number;
}

//this components displays three ocunter for tracks and follower and following and string text of choice and color
const StatsGroup = ({
  countTracks,
  countFollowers,
  countFollowing,
}: StateItemProps) => {
  return (
    <div className="flex flex-nowrap gap-4">
      {/* there is no followers page implemented ????  */}
      <Link href={ROUTES.FOLLOWING}>
        <StateItem count={countFollowers} text="Followers" />
      </Link>
      <Link href={ROUTES.FOLLOWING}>
        <StateItem count={countFollowing} text="Following" />
      </Link>
      <StateItem count={countTracks} text="Tracks" />
    </div>
  );
};

export default StatsGroup;
