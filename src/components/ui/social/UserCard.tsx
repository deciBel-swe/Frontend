import AvatarImage from "@/components/ui/AvatarImage";
import VerifiedBadge from "@/components/icons/VerifiedBadge";
import FollowButton from "@/components/buttons/FollowButton";    
import  {UserIcon}  from "@/components/icons/GenrealIcons";

export interface UserCardData {
  id: string;
  username: string;
  displayName: string;
  avatarSrc?: string;
  followerCount: number;
  isVerified?: boolean;
  isFollowing?: boolean;
}

interface UserCardProps {
  user: UserCardData;
  onFollowToggle?: (userId: string) => void;
  showFollowButton?: boolean;
  className?: string;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

/**
 * UserCard — circular avatar card shown in the 6-column following/followers grid.
 */
export default function UserCard({
  user,
  onFollowToggle,
  showFollowButton = false,
  className = "",
}: UserCardProps) {
  return (
    <div className={`flex flex-col items-center gap-2 w-40 text-center ${className}`}>
      {/* Avatar */}
      <a
        href={`/${user.username}`}
        className="block no-underline"
        aria-label={`Visit ${user.displayName}'s profile`}
      >
        <AvatarImage src={user.avatarSrc} alt={user.displayName} size={140} shape="circle" />
      </a>

      {/* Name + verified */}
      <a href={`/${user.username}`} className="no-underline">
        <span className="flex items-center gap-1 justify-center flex-wrap">
          <span className="text-xs font-bold text-text-primary leading-snug break-words">
            {user.displayName}
          </span>
          {user.isVerified && <VerifiedBadge size={13} />}
        </span>
      </a>

      {/* Follower count */}
      <span className="flex items-center gap-1 text-xs text-text-muted">
        <UserIcon />
        <span>{formatCount(user.followerCount)} followers</span>
      </span>

      {/* Follow button */}
      {showFollowButton && onFollowToggle && (
        <FollowButton/>
      )}
    </div>
  );
}