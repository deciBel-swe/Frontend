import { FC } from 'react';
import Button from '@/components/buttons/Button';
import { UserRow } from '@/features/admin/types/types';
import { UserStatusBadge } from '@/features/admin/shared';

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
  type,
  status,
  onReinstate,
}) => (
  <tr className="border-b border-border-default hover:bg-bg-subtle transition-colors">
    <td className="py-2 px-3">
      <span className="text-sm text-text-primary">{username}</span>
    </td>
    <td className="py-2 px-3 text-sm text-text-secondary capitalize">{type}</td>
    <td className="py-2 px-3">
      <UserStatusBadge status={status} />
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