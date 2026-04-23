'use client';

import { UsersDashboard } from '@/features/admin/components/users/UsersDashboard';
// import { SectionHeader, StatCard } from '@/features/admin/index';
import { UsersDashboardData } from '@/features/admin/types/types';
import {  UserRole, UserStatus} from '@/features/admin/types/types'

const USERS_DATA: UsersDashboardData = {
  suspendedCount: 3,
  users: [
    { id: 'u1', username: 'test user', type: UserRole.LISTENER, status: UserStatus.SUSPENDED },
    { id: 'u2', username: 'test user', type: UserRole.ARTIST, status: UserStatus.ACTIVE },
    { id: 'u3', username: 'test user', type: UserRole.LISTENER, status: UserStatus.SUSPENDED },
  ],
};
export default function AdminUsersPage() {
  return (
    <main className="p-6 space-y-6">
      <UsersDashboard data={USERS_DATA} />
    </main>
  );
}
