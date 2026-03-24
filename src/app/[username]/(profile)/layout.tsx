import ProfileHeader from '@/features/prof/components/ProfileHeader';
import ProfileSideBar from '@/features/prof/components/ProfileSideBar';
import MidBar from '@/features/prof/components/MidBar';
import LayoutContainer from '@/components/LayoutContainer'
import { ProfileGuard } from '@/components/profile-guard';

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) => {
  const { username } = await params;

  return (
    <ProfileGuard username={username}>
      <div className="w-full">
      {/* HEADER */}
      <ProfileHeader username={username} />

      {/* CONTENT AREA */}
      <LayoutContainer>
        <MidBar username={username} />

        <div className="flex w-full mt-6 gap-6">
          <div className="flex-1 min-w-0">
            {children}
          </div>

          <div className="w-[340px] hidden lg:block shrink-0">
            <ProfileSideBar username={username} />
          </div>
        </div>
      </LayoutContainer>
    </div>
    </ProfileGuard>

  );
};

export default Layout;
