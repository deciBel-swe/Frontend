/**
 * @description Users tab — suspended users table with reinstate actions.
 * Circle count widget removed; filtering to suspended-only happens in UsersTable.
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
 * UsersDashboard - Shows only suspended users so the admin can reinstate them.
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
      totalSuspended={data.suspendedCount}
      onReinstate={onReinstate}
    />
  </div>
);