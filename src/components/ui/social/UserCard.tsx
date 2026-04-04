import AvatarImage from "@/components/ui/AvatarImage";
import VerifiedBadge from "@/components/icons/VerifiedBadge";
import FollowButton from "@/components/buttons/FollowButton";    
import  {UserIcon}  from "@/components/icons/GenrealIcons";
import { useUserCardHook } from '@/hooks/useUserCardHook';

export interface UserCardData {
  id: string;
  username: string;
  avatarSrc?: string;
  followerCount: number;
  isVerified?: boolean;
  isFollowing?: boolean;
}

interface UserCardProps {
  user: UserCardData;
  onFollowToggle?: (userId: string) => void;
  showFollowButton?: boolean;
  isOwnProfile?: boolean;
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
  const {
    user: resolvedUser,
    isFollowPending,
    handleFollowToggle,
  } = useUserCardHook({
    user,
    onFollowToggle,
  });

  return (
    <div className={`group flex flex-col items-center gap-2 w-40 text-center ${className}`}>
      {/* Avatar */}
      <a
        href={`/${resolvedUser.username.toLowerCase().replace(/\s+/g, '')}`}
        className="block no-underline"
        aria-label={`Visit ${resolvedUser.username}'s profile`}
      >
        <AvatarImage src={resolvedUser.avatarSrc} alt={resolvedUser.username} size={160} shape="circle" />
      </a>

      {/* Name + verified */}
      <a href={`/${resolvedUser.username.toLowerCase().replace(/\s+/g, '')}`} className="no-underline">
        <span className="flex items-center gap-1 justify-center flex-wrap">
          <span className="text-sm font-bold text-text-primary leading-snug break-words">
            {resolvedUser.username}
          </span>
          {resolvedUser.isVerified && <VerifiedBadge size={13} />}
        </span>
      </a>

      {/* Follower count */}
      <span className="flex items-center gap-1 text-xs text-text-muted">
        <UserIcon />
        <span>{formatCount(resolvedUser.followerCount)} followers</span>
      </span>

      {/* Follow button */}
      {showFollowButton && (
        <div className="h-8 flex items-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <FollowButton
              size="sm"
              isFollowing={resolvedUser.isFollowing}
              onToggle={handleFollowToggle}
              disabled={isFollowPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}