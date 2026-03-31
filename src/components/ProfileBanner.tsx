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
          className="h-full w-full bg-surface-raised"
        />
      )}
    </div>
  );
};

export default ProfileBanner;
