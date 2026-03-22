interface ProfileAvatarProps {
  avatarUrl?: string;
}

const ProfileAvatar = ({ avatarUrl }: ProfileAvatarProps) => {
  return (
    <div className="relative -mt-16 h-32 w-32 shrink-0 md:-mt-20 md:h-40 md:w-40">
      <div className="h-full w-full rounded-full border-[6px] border-[#0a0a0a] bg-[#1a1a1a] overflow-hidden shadow-2xl">
        {avatarUrl ? (
          <img src={avatarUrl} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-gray-400">
            Image failed to load
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;
