import ProfileHeader from '@/features/prof/components/ProfileHeader';
import ProfileSideBar from '@/features/prof/components/ProfileSideBar';
import MidBar from '@/features/prof/components/MidBar';
import LayoutContainer from '@/components/LayoutContainer'
import ProfileNav from '@/components/ProfileNav'
const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{username: string }>;
}) => {
  const { username } = await params;

  return (
     <div className="w-full">
      {/* HEADER now behaves like others */}
      <LayoutContainer>
        <div className="overflow-x-auto">
          <ProfileHeader username={username} />
        </div>
      </LayoutContainer>

      {/* NAV */}
      <LayoutContainer>
        <div className="overflow-x-wrap">
          <MidBar username={username} />
        </div>
      </LayoutContainer>

      {/* CONTENT */}
      <LayoutContainer>
        <div className="flex w-full mt-6 gap-6">
          <div className="flex-1">{children}</div>

          <div className="w-[340px] hidden lg:block">
            <ProfileSideBar username={username} />
          </div>
        </div>
      </LayoutContainer>
    </div>
  );
};

export default Layout;
