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
        // High-end dark gradient fallback
        <div className="h-full w-full bg-gradient-to-br from-[#1a1a1a] via-[#333] to-[#121212]" />
      )}
    </div>
  );
};

export default ProfileBanner;
