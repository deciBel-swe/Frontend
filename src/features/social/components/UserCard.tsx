import AvatarImage from "@/components/avatars/AvatarImage";
import VerifiedBadge from "@/components/icons/VerifiedBadge";
import FollowButton from "@/components/buttons/FollowButton";
import { UserIcon } from "@/components/icons/GenrealIcons";
import { useUserCardHook } from '@/hooks/useUserCardHook';

export interface UserCardData {
  id: string;
  username: string;
  displayName?: string;
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
  /** vertical = circular grid card (default), horizontal = search result row */
  variant?: 'vertical' | 'horizontal';
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function getUserSlug(username: string): string {
  return username.toLowerCase().replace(/\s+/g, '');
}

/**
 * UserCard — circular avatar card shown in the 6-column following/followers grid.
 *
 * Extended with a `variant` prop to support a second layout without breaking
 * existing usages:
 *
 * - `vertical` (default): original circular avatar card with centered text,
 *   used in the following/followers 6-column grid. Follow button fades in on
 *   hover.
 * - `horizontal`: wide search-result row — small circular avatar on the left,
 *   display name + username + follower count in the center, follow button
 *   pinned to the far right (always visible, no hover needed).
 *
 * @example
 * // Existing vertical grid usage — no change required
 * <UserCard user={user} showFollowButton />
 *
 * // New horizontal search-result usage
 * <UserCard user={user} variant="horizontal" showFollowButton />
 */
export default function UserCard({
  user,
  onFollowToggle,
  showFollowButton = false,
  variant = 'vertical',
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

  const slug = getUserSlug(resolvedUser.username);

  if (variant === 'horizontal') {
    return (
      <div className={`group flex items-center gap-4 w-full py-3 px-1 ${className}`}>
        {/* Avatar */}
        <a href={`/${slug}`} aria-label={`Visit ${resolvedUser.username}'s profile`} className="shrink-0">
          <AvatarImage
            src={resolvedUser.avatarSrc}
            alt={resolvedUser.username}
            size={160}
            shape="circle"
          />
        </a>

        {/* Name + meta */}
        <a href={`/${slug}`} className="flex-1 min-w-0 no-underline">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-sm font-semibold text-text-primary truncate leading-snug">
              {resolvedUser.displayName || resolvedUser.username}
            </span>
            {resolvedUser.isVerified && <VerifiedBadge size={13} />}
          </div>
          <div className="text-xs text-text-muted mt-0.5 truncate">
            {resolvedUser.username}
          </div>
          <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
            <UserIcon />
            <span>{formatCount(resolvedUser.followerCount)} followers</span>
          </div>
        </a>

        {/* Follow button — always visible in horizontal mode */}
        {showFollowButton && (
          <div className="shrink-0">
            <FollowButton
              size="sm"
              isFollowing={resolvedUser.isFollowing}
              onToggle={handleFollowToggle}
              disabled={isFollowPending}
            />
          </div>
        )}
      </div>
    );
  }

  // ── vertical (default) ──────────────────────────────────────────────────
  return (
    <div className={`group flex flex-col items-center gap-2 w-40 text-center ${className}`}>
      {/* Avatar */}
      <a 
        href={`/${slug}`} 
        className="block no-underline" 
        aria-label={`Visit ${resolvedUser.username}'s profile`}
      >
        <AvatarImage src={resolvedUser.avatarSrc} alt={resolvedUser.username} size={160} shape="circle" />
      </a>
      {/* Name + verified */}
      <a href={`/${slug}`} className="no-underline">
        <span className="flex items-center gap-1 justify-center flex-wrap">
          <span className="text-sm font-bold text-text-primary leading-snug break-words">
            {resolvedUser.displayName || resolvedUser.username}
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