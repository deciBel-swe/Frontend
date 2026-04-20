import { FC } from 'react';
import { UserRow, UserStatus } from '@/features/admin/types/types';
import { UserTableRow } from './UsersTableRow';
import { SectionHeader } from '@/features/admin/shared';

const TABLE_HEADERS = ['user', 'type', 'status', 'actions'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface UsersTableProps {
  users: UserRow[];
  totalSuspended: number;
  onReinstate?: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * UsersTable - Displays only suspended users so the admin can reinstate them.
 * Filters out active users before rendering — no filter UI needed.
 */
export const UsersTable: FC<UsersTableProps> = ({
  users,
  totalSuspended,
  onReinstate,
}) => {
  const suspendedUsers = users.filter((u) => u.status === UserStatus.SUSPENDED);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <SectionHeader
          title="Suspended users"
          count={`${totalSuspended.toLocaleString()} total`}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border-default">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-default bg-bg-subtle">
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  className="py-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suspendedUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={TABLE_HEADERS.length}
                  className="py-6 text-center text-sm text-text-muted"
                >
                  No suspended users
                </td>
              </tr>
            ) : (
              suspendedUsers.map((user) => (
                <UserTableRow
                  key={user.id}
                  {...user}
                  onReinstate={onReinstate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};