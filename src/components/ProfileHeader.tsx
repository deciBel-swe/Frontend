import ProfileAvatar from './ProfileAvatar';
import ProfileBanner from './ProfileBanner';

interface ProfileHeaderProps {
  params: Promise<{
    coverPhotoUrl?: string;
    avatarUrl?: string;
    username: string;
  }>;
}

const ProfileHeader = async ({ params }: ProfileHeaderProps) => {
  const { coverPhotoUrl, avatarUrl, username } = await params;
  return (
    <div className="relative">
      <ProfileBanner
        params={Promise.resolve({
          coverPhotoUrl: coverPhotoUrl,
        })}
      />
      <div className="absolute top-1/2 left-10 -translate-y-1/2 flex items-center gap-4">
        <ProfileAvatar
          params={Promise.resolve({
            avatarUrl: avatarUrl,
          })}
        />
        <span
          className="text-xl font-bold text-white bg-black"
          style={{ padding: '8px 8px' }}
        >
          {username}
        </span>
      </div>
    </div>
  );
};

export default ProfileHeader;
