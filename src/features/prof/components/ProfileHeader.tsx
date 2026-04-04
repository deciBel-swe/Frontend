'use client';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import ProfileAvatar from './ProfileAvatar';
import ProfileBanner from './ProfileBanner';

interface ProfileHeaderProps {
  username: string;
}

const ProfileHeader = ({ username }: ProfileHeaderProps) => {
  const { data } = usePublicUser(username);
  const location = [data?.profile.city, data?.profile.country]
    .filter(Boolean)
    .join(', ');
  const favoriteGenres = (data?.profile.favoriteGenres ?? []).filter(
    (genre): genre is string => Boolean(genre?.trim())
  );

  return (
    <div className="relative">
      <ProfileBanner coverPhotoUrl={data?.profile.coverPic} />
      <div className="absolute top-1/2 left-10 -translate-y-1/2 flex items-center gap-4">
        <ProfileAvatar avatarUrl={data?.profile.profilePic} />
        <div className="flex flex-col gap-1 items-start">
          <span className="text-2xl font-bold text-neutral-0 bg-surface-overlay/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
            {username}
          </span>
          <span className="text-l font-bold text-neutral-0 bg-surface-overlay/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
            {location}
          </span>
          {favoriteGenres.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {favoriteGenres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-surface-overlay/60 px-2 py-0.5 text-[11px] font-semibold text-neutral-0 backdrop-blur-sm"
                >
                  #{genre}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
