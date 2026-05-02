import Image from "next/image";
interface ProfileBannerProps {
  coverPhotoUrl?: string;
}

const ProfileBanner = ({ coverPhotoUrl }: ProfileBannerProps) => {
  return (
    <div className="h-[200px] w-full overflow-hidden md:h-[300px]">
      {coverPhotoUrl ? (
        <Image
          src={coverPhotoUrl}
          alt="Profile Banner"
          className="h-full w-full object-cover"
          width={1200}
          height={300}
        />
      ) : (
        <div
          className="h-full w-full bg-gradient-to-br from-surface-default via-bg-subtle to-text-secondary dark:from-neutral-1000 dark:via-neutral-500 dark:to-bg-base"
        />
      )}
    </div>
  );
};

export default ProfileBanner;
