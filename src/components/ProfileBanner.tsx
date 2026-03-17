import { useTheme } from 'next-themes';

interface ProfileBannerProps {
  params: Promise<{ coverPhotoUrl?: string }>;
}

const ProfileBanner = async ({ params }: ProfileBannerProps) => {
  const { coverPhotoUrl } = await params;
  return (
    <div className="h-[200px] w-full overflow-hidden md:h-[300px]">
      {coverPhotoUrl ? (
        <img
          src={coverPhotoUrl}
          alt="Profile Banner"
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="h-full w-full bg-gradient-to-br 
          from-white via-gray-200 to-gray-400 
          dark:from-black dark:via-gray-800 dark:to-gray-900"
        />
      )}
    </div>
  );
};

export default ProfileBanner;
