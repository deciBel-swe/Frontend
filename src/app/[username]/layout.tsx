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
  const normalizedUsername = username.toLowerCase().trim();
  
  // Bypass ProfileGuard for settings routes (these are handled via proxy redirect)
  if (normalizedUsername === 'settings') {
    return <>{children}</>;
  }

  return (
    <ProfileOwnerProvider username={username}>
      <ProfileGuard username={username}>{children}</ProfileGuard>
    </ProfileOwnerProvider>
  );
};

export default Layout;