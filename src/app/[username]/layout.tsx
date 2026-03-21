import ProfileHeader from '@/features/prof/components/ProfileHeader';
import ProfileSideBar from '@/features/prof/components/ProfileSideBar';
import MidBar from '@/features/prof/components/MidBar';

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{username: string }>;
}) => {
  const { username } = await params;

  return (
    <div>
      <div>
        <ProfileHeader username={username} />
      </div>
      <MidBar username={username} />
      <div className="flex w-full mt-6 px-8">
        <div className="flex-1">{children}</div>
        <div className="w-[340px] ml-10">
          <ProfileSideBar username={username} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
