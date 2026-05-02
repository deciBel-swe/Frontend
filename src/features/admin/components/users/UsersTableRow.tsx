import { FC } from 'react';
import Button from '@/components/buttons/Button';
import { UserRow } from '@/features/admin/types/types';

// ─── User Table Row ───────────────────────────────────────────────────────────

interface UserTableRowProps extends UserRow {
  onReinstate?: (id: string) => void;
}

/**
 * UserTableRow - Single row in the suspended users table.
 * Only shows reinstate action since the table exclusively shows suspended users.
 */
export const UserTableRow: FC<UserTableRowProps> = ({
  id,
  username,
  displayName,
  avatarUrl,
  isBanned,
  onReinstate,
}) => (
  <tr className="border-b border-border-default hover:bg-bg-subtle transition-colors">
    <td className="py-2 px-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-bg-subtle">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${displayName} avatar`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-text-muted">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-text-primary">{displayName}</span>
          <span className="text-xs text-text-muted">@{username}</span>
        </div>
      </div>
    </td>
    <td className="py-2 px-3 text-sm text-text-secondary">
      #{id}
    </td>
    <td className="py-2 px-3 text-sm text-text-secondary">
      {isBanned ? 'Banned' : 'Active'}
    </td>
    <td className="py-2 px-3">
      <Button
        size="sm"
        id="reinstate"
        variant="secondary"
        onClick={() => onReinstate?.(id)}
      >
        Reinstate
      </Button>
    </td>
  </tr>
);
