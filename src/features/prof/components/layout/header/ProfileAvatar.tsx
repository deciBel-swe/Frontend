interface ProfileAvatarProps {
  avatarUrl?: string;
}
import Image from "next/image";
const DEFAULT_AVATAR =
  "/images/default_song_image.png"; // replace with your preferred avatar

const ProfileAvatar = ({ avatarUrl }: ProfileAvatarProps) => {
  const imageSrc = avatarUrl || DEFAULT_AVATAR;

  return (
    <div className="relative -mt-16 h-32 w-32 shrink-0 md:-mt-20 md:h-40 md:w-40">
      <div className="h-full w-full rounded-full overflow-hidden shadow-2xl">
        <Image
          src={imageSrc}
          className="h-full w-full object-cover"
          width={160}
          height={160}
          alt="Profile Avatar"
        />
      </div>
    </div>
  );
};

export default ProfileAvatar;