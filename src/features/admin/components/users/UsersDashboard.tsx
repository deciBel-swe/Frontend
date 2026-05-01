/**
 * @description Users tab — banned users table with reinstate actions.
 * Circle count widget removed; filtering happens in the page/service layer.
 */

import { FC } from 'react';
import { UsersDashboardData } from '@/features/admin/types/types';
import { UsersTable } from './UsersTable';

// ─── Props ────────────────────────────────────────────────────────────────────

interface UsersDashboardProps {
  data: UsersDashboardData;
  onReinstate?: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * UsersDashboard - Shows banned users so the admin can reinstate them.
 *
 * @example
 * <UsersDashboard
 *   data={usersData}
 *   onReinstate={(id) => handleReinstate(id)}
 * />
 */
export const UsersDashboard: FC<UsersDashboardProps> = ({
  data,
  onReinstate,
}) => (
  <div>
    <UsersTable
      users={data.users}
      totalBanned={data.bannedCount}
      onReinstate={onReinstate}
    />
  </div>
);
