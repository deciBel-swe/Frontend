import { useEffect, useState } from 'react';
import { UserService, RealUserService } from '@/services/api/userService';
import { MockUserService } from '@/services/mocks/userService';
import { config } from '@/config/index';
import { SocialItem, SideBarData } from '@/types/user';

/**
 * Hook to get profile sidebar data (stats + social links)
 */
export const useProfileSideBar = (username: string) => {
  const [data, setData] = useState<SideBarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service: UserService = config.api.useMock
    ? new MockUserService()
    : new RealUserService();

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const user = await service.getPublicUser(username);

        const socialItems: SocialItem[] = [
          { label: 'Instagram', url: user.socialLinks.instagram },
          { label: 'Twitter', url: user.socialLinks.twitter },
          { label: 'Website', url: user.socialLinks.website },
        ].filter((item) => Boolean(item.url));

        const mapped: SideBarData = {
          countTracks: user.stats.trackCount,
          countFollowers: user.stats.followersCount,
          countFollowing: user.stats.followingCount,
          bio: user.profile.bio,
          socialItems: socialItems,
        };

        setData(mapped);
      } catch (err) {
        setError('Failed to fetch user stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [username]);

  return { data, isLoading, error };
};
