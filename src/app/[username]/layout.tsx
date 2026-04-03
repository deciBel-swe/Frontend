import type { ReactNode } from 'react';
import { ProfileGuard } from '@/components/profile-guard';
import { ProfileOwnerProvider } from '@/features/prof/context/ProfileOwnerContext';

const Layout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ username: string }>;
}) => {
  const { username } = await params;

  return (
    <ProfileOwnerProvider username={username}>
      <ProfileGuard username={username}>{children}</ProfileGuard>
    </ProfileOwnerProvider>
  );
};

export default Layout;