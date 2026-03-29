import AvatarImage from "@/components/ui/AvatarImage";
import { usePublicUser } from "@/features/prof/hooks/usePublicUser";
import { useParams } from "next/navigation";

interface SocialPageHeaderProps {
  listType: "following" | "followers";
  className?: string;
}

/**
 * SocialPageHeader — renders the heading block at the top of
 * [username]/following and [username]/followers.
 *
 * Stateless. No hardcoded colors.
 */
export default function SocialPageHeader({
  listType,
  className = "",
}: SocialPageHeaderProps) {
    const { username } = useParams<{ username: string }>();
    const { data: profileData } = usePublicUser(username);

  const heading =
    listType === "followers"
      ? `Followers of ${username}`
      : `${username} is following`;



  return (
    <div className={`flex items-center gap-4 mb-7 ${className}`}>
      <a href={`/${username}`} className="no-underline shrink-0">
        <AvatarImage
          src={profileData?.profile.avatarUrl}
          alt={username}
          size={72}
          shape="circle"
        />
      </a>
      <h1 className="text-2xl font-bold text-text-primary tracking-tight leading-tight m-0">
        {heading}
      </h1>
    </div>
  );
}