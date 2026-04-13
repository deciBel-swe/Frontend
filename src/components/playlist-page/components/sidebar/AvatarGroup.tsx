import AvatarImage from '@/components/avatars/AvatarImage';
import type { SearchUser } from '@/types/user';

interface AvatarGroupProps {
  users: SearchUser[];
  size?: number;
  className?: string;
}

const DEFAULT_SIZE = 40;

const getUserLabel = (user: SearchUser) =>
  user.displayName?.trim() || user.username?.trim() || 'User';

export default function AvatarGroup({
  users,
  size = DEFAULT_SIZE,
  className = '',
}: AvatarGroupProps) {
  if (users.length === 0) {
    return null;
  }

  const shouldOverlap = users.length > 5;

  return (
    <div
      className={`flex items-center ${className}`.trim()}
      aria-label={`${users.length} users`}
    >
      {users.map((user, index) => {
        const label = getUserLabel(user);

        return (
          <div
            key={user.id ?? `${user.username ?? 'user'}-${index}`}
            className={shouldOverlap && index > 0 ? '-ml-3' : ''}
            style={{ zIndex: users.length - index }}
          >
            <AvatarImage
              src={user.avatarUrl ?? undefined}
              alt={label}
              size={size}
              shape="circle"
              className="border-2 border-border-default shadow-sm"
            />
          </div>
        );
      })}
    </div>
  );
}
