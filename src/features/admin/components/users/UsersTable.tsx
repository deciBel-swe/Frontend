import { FC } from 'react';
import { UserRow } from '@/features/admin/types/types';
import { UserTableRow } from './UsersTableRow';
import { SectionHeader } from '@/features/admin/shared';

const TABLE_HEADERS = ['user', 'followers', 'tracks', 'actions'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface UsersTableProps {
  users: UserRow[];
  totalBanned: number;
  onReinstate?: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const UsersTable: FC<UsersTableProps> = ({
  users,
  totalBanned,
  onReinstate,
}) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <SectionHeader
          title="Banned users"
          count={`${totalBanned.toLocaleString()} total`}
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
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={TABLE_HEADERS.length}
                  className="py-6 text-center text-sm text-text-muted"
                >
                  No banned users
                </td>
              </tr>
            ) : (
              users.map((user) => (
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
