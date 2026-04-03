import type { ReactNode } from 'react';
import { ProfileGuard } from '@/components/profile-guard';

const Layout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ username: string }>;
}) => {
  const { username } = await params;

  return <ProfileGuard username={username}>{children}</ProfileGuard>;
};

export default Layout;