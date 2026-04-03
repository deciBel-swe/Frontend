import AvatarImage from "@/components/ui/AvatarImage";
import { usePublicUser } from "@/features/prof/hooks/usePublicUser";
import { useParams } from "next/navigation";

export type ListType = "following" | "followers" | "likes";

interface SocialPageHeaderProps {
  profileUsername: string;
  profileAvatarSrc?: string;
  listType: ListType;
  className?: string;
}

/**
 * SocialPageHeader — renders the heading block at the top of
 * [username]/following, [username]/followers and [username]/likes.
 *
 */
export default function SocialPageHeader({
  listType,
  className = "",
}: SocialPageHeaderProps) {
    const { username } = useParams<{ username: string }>();
    const { data: profileData } = usePublicUser(username);

const heading: Record<ListType, string> = {
    likes:     `Likes by ${username}`,
    following: `${username} is following`,
    followers: `Followers of ${username}`,
  };


  return (
    <div className={`flex items-center gap-4 mb-7 ${className}`}>
      <a href={`/${username}`} className="no-underline shrink-0">
        <AvatarImage
          src={profileData?.profile.profilePic}
          alt={username}
          size={72}
          shape="circle"
        />
      </a>
      <h1 className="text-2xl font-bold text-text-primary tracking-tight leading-tight m-0">
        {heading[listType]}
      </h1>
    </div>
  );
}