'use client';
import { useUserHeader } from '@/features/prof/useUserHeader';
import ProfileAvatar from './ProfileAvatar';
import ProfileBanner from './ProfileBanner';

interface ProfileHeaderProps {
  username: string;
}

const ProfileHeader = ({ username }: ProfileHeaderProps) => {
  const { data, isLoading, error } = useUserHeader(username);
  return (
    <div className="relative">
      <ProfileBanner coverPhotoUrl={data?.coverPhotoUrl} />
      <div className="absolute top-1/2 left-10 -translate-y-1/2 flex items-center gap-4">
        <ProfileAvatar avatarUrl={data?.avatarUrl} />
        <div className="flex flex-col gap-1 items-start">
          <span className="text-xl font-bold text-white bg-black p-2">
            {username}
          </span>
          <span className="text-xl font-bold text-gray-400 bg-black p-2">
            {data?.location}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
