import ProfileAvatar from './ProfileAvatar';
import ProfileBanner from './ProfileBanner';

interface ProfileHeaderProps {
  params: Promise<{ coverPhotoUrl?: string; avatarUrl?: string }>;
}

const ProfileHeader = async ({ params }: ProfileHeaderProps) => {
  const { coverPhotoUrl, avatarUrl } = await params;
  return (
    <div className="relative">
      <ProfileBanner
        params={Promise.resolve({
          coverPhotoUrl: 'https://i.ibb.co/604S7P6G/sl-063022-51250-12.jpg',
        })}
      />
      <div className="absolute top-1/2 left-10 -translate-y-1/2">
        <ProfileAvatar
          params={Promise.resolve({
            avatarUrl: 'https://i.ibb.co/yB5VBGsN/fern.jpg',
          })}
        />
      </div>
    </div>
  );
};

export default ProfileHeader;
