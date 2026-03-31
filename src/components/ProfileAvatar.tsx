interface ProfileAvatarProps {
  params: Promise<{ avatarUrl?: string }>;
}

const ProfileAvatar = async ({ params }: ProfileAvatarProps) => {
  const { avatarUrl } = await params;

  return (
    <div className="relative -mt-16 h-32 w-32 shrink-0 md:-mt-20 md:h-40 md:w-40">
      <div className="h-full w-full rounded-full border-[6px] border-bg-base bg-bg-subtle overflow-hidden shadow-2xl">
        {avatarUrl ? (
          <img src={avatarUrl} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-text-muted">
            Image failed to load
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;
