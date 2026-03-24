'use client';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import ProfileAvatar from './ProfileAvatar';
import ProfileBanner from './ProfileBanner';

interface ProfileHeaderProps {
  username: string;
}

const ProfileHeader = ({ username }: ProfileHeaderProps) => {
  const { data } = usePublicUser(username);
  return (
    <div className="relative">
      <ProfileBanner coverPhotoUrl={data?.profile.coverPhotoUrl} />
      <div className="absolute top-1/2 left-10 -translate-y-1/2 flex items-center gap-4">
        <ProfileAvatar avatarUrl={data?.profile.avatarUrl} />
        <div className="flex flex-col gap-1 items-start">
          <span className="text-2xl font-bold text-neutral-0 bg-surface-overlay/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
            {username}
          </span>
          <span className="text-l font-bold text-neutral-0 bg-surface-overlay/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
            {data?.profile.location}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
