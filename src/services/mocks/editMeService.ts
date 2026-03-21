import type { editMeService } from '@/services/api/editMeService';
import type { UpdateMeRequest, UserMe } from '@/types/user';

/**
 * Mock implementation of editMeService for testing or development without backend.
 */
export class MockEditMeService implements editMeService {
  async editMe(token: string, data: UpdateMeRequest): Promise<UserMe> {
    const mergedSocialLinks = {
      instagram: 'http://example.com/instagram',
      website: 'http://example.com/website',
      supportLink: 'http://example.com/support',
      twitter: 'http://example.com/twitter',
      ...(data.socialLinks ?? {}),
    };
    var response: UserMe = {
      id: 1,
      Role: 'LISTENER',
      email: 'mockuser@example.com',
      username: 'mockuser',
      emailVerified: true,
      tier: 'ARTIST',
      profile: {
        bio: 'Mock bio',
        city: 'Mock City',
        country: 'Mock Country',
        profilePic: 'http://example.com/profile.jpg',
        coverPic: 'http://example.com/cover.jpg',
        favoriteGenres: ['Mock Genre'],
      },
      privacySettings: {
        isPrivate: false,
        showHistory: true,
      },
      stats: {
        followers: 100,
        following: 50,
        tracksCount: 10,
      },
      ...data,
      socialLinks: mergedSocialLinks,
    };
    console.log(
      'MockEditMeService.editMe called with data:',
      data,
      'Response:',
      response
    );
    // Return a mock user object, merging defaults with provided data
    return response;
  }
}
