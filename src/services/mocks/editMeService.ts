import type { editMeService } from '@/services/api/editMeService';
import type { UpdateMeRequest, UserMe } from '@/types/user';
import {
  getMockUsersStore,
  persistMockSystemState,
  resolveCurrentMockUserId,
  syncAuthAccountsToMockUsers,
} from './mockSystemStore';

/**
 * Mock implementation of editMeService for testing or development without backend.
 */
export class MockEditMeService implements editMeService {
  async editMe(token: string, data: UpdateMeRequest): Promise<UserMe> {
    void token;
    syncAuthAccountsToMockUsers();

    const currentUserId = resolveCurrentMockUserId();
    const me = getMockUsersStore().find((user) => user.id === currentUserId);

    if (!me) {
      throw new Error('Current user not found');
    }

    if (data.bio !== undefined) me.profile.bio = data.bio;
    if (data.city !== undefined) me.profile.city = data.city;
    if (data.country !== undefined) me.profile.country = data.country;
    if (data.favoriteGenres !== undefined) {
      me.profile.favoriteGenres = [...data.favoriteGenres];
    }
    if (data.socialLinks) {
      me.socialLinks = {
        ...me.socialLinks,
        ...data.socialLinks,
      };
    }

    persistMockSystemState();

    return {
      id: me.id,
      Role: me.role,
      email: me.email,
      username: me.username,
      emailVerified: me.emailVerified,
      tier: me.tier,
      profile: {
        bio: me.profile.bio,
        city: me.profile.city,
        country: me.profile.country,
        profilePic: me.profile.profilePic,
        coverPic: me.profile.coverPic,
        favoriteGenres: [...me.profile.favoriteGenres],
      },
      socialLinks: {
        instagram: me.socialLinks.instagram,
        website: me.socialLinks.website,
        supportLink: me.socialLinks.supportLink,
        twitter: me.socialLinks.twitter,
      },
      privacySettings: {
        ...me.privacySettings,
      },
      stats: {
        followers: me.followers.size,
        following: me.following.size,
        tracksCount: me.tracks.length,
      },
    };
  }
}
