import { MockUserService } from '@/services/mocks/userService';
import { MockAuthService } from '@/services/mocks/authService';

const PASSWORD1_HASH =
  '0c259750cf512f112aa470d477f7fd002fea27aa2893fe2e077555e28fcd4541';

jest.mock('@/utils/sha256', () => ({
  sha256Hex: jest.fn(async (value: string) =>
    value === 'Password1' ? PASSWORD1_HASH : 'f'.repeat(64)
  ),
}));

describe('MockUserService', () => {
  let service: MockUserService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new MockUserService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const flush = async (ms = 250) => {
    await jest.advanceTimersByTimeAsync(ms);
  };
  it('updates profile and social links', async () => {
    const updatePromise = service.updateMe({
      displayName: 'Updated Mock User',
      bio: 'updated bio',
      city: 'Giza',
      socialLinks: {
        twitter: 'https://twitter.com/newmockuser',
      },
    });

    await flush();
    const updated = await updatePromise;

    expect(updated.profile.bio).toBe('updated bio');
    expect(updated.profile.city).toBe('Giza');
    expect(updated.socialLinks.twitter).toBe('https://twitter.com/newmockuser');
  });

  it('handles follow, unfollow, block, unblock lifecycle', async () => {
    const followPromise = service.followUser(3);
    await flush();
    const followed = await followPromise;

    expect(followed.isFollowing).toBe(true);

    const followingListPromise = service.getFollowing(1, {
      page: 0,
      size: 10,
    });
    await flush();
    const followingList = await followingListPromise;

    expect(followingList.content.some((user) => user.id === 3)).toBe(true);

    const blockPromise = service.blockUser(3);
    await flush();
    const blocked = await blockPromise;
    expect(blocked.message).toContain('Blocked');

    const blockedListPromise = service.getBlockedUsers({
      page: 0,
      size: 10,
    });
    await flush();
    const blockedList = await blockedListPromise;
    expect(blockedList.content.some((user) => user.id === 3)).toBe(true);

    const unblockPromise = service.unblockUser(3);
    await flush();
    const unblocked = await unblockPromise;
    expect(unblocked.message).toContain('Unblocked');

    const unfollowPromise = service.unfollowUser(3);
    await flush();
    const unfollowed = await unfollowPromise;
    expect(unfollowed.isFollowing).toBe(false);
  });

  it('returns paginated history and tracks', async () => {
    const historyPromise = service.getHistory({ page: 0, size: 2 });
    await flush();
    const history = await historyPromise;

    expect(history.content).toHaveLength(2);
    expect(history.pageSize).toBe(2);

    const tracksPromise = service.getUserTracks(1, { page: 0, size: 2 });
    await flush();
    const tracks = await tracksPromise;

    expect(tracks.content).toHaveLength(2);
    expect(tracks.totalElements).toBeGreaterThanOrEqual(2);
  });

  it('returns playlists for current and public users', async () => {
    const mePlaylistsPromise = service.getMePlaylists({ page: 0, size: 2 });
    await flush();
    const mePlaylists = await mePlaylistsPromise;
    expect(mePlaylists.length).toBeGreaterThan(0);

    const publicPlaylistsPromise = service.getUserPlaylists('user001', {
      page: 0,
      size: 2,
    });
    await flush();
    const publicPlaylists = await publicPlaylistsPromise;
    expect(publicPlaylists.length).toBeGreaterThan(0);
  });

  it.skip('returns liked playlists for a user', async () => {
    const likedPromise = service.getUserLikedPlaylists('listenertwo', {
      page: 0,
      size: 5,
    });
    await flush();
    const liked = await likedPromise;

    expect(liked.content.length).toBeGreaterThan(0);
    expect(liked.pageSize).toBe(5);
  });

  it('updates account security and tier data', async () => {
    const addEmailPromise = service.addNewEmail({
      newEmail: 'new@mail.com',
    });
    await flush();
    const addEmail = await addEmailPromise;
    expect(addEmail.message).toBe('Email added');

    const primaryEmailPromise = service.updatePrimaryEmail({
      newEmail: 'primary@mail.com',
    });
    await flush();
    const primaryEmail = await primaryEmailPromise;
    expect(primaryEmail.message).toContain('Primary email');

    const tierPromise = service.updateTier({
      newTier: 'ARTIST_PRO',
    });
    await flush();
    const tier = await tierPromise;
    expect(tier.tier).toBe('ARTIST_PRO');
  });

  it('uses logged-in mock session user as current user', async () => {
    const auth = new MockAuthService();
    const email = 'session.user@decibel.test';
    const password = 'Password1';

    const registerPromise = auth.registerLocal({
      email,
      displayName: 'session-user',
      password,
      dateOfBirth: '2001-01-01',
      gender: 'female',
      captchaToken: 'mock-captcha-token',
    });
    await flush(400);
    await registerPromise;

    const loginPromise = auth.login(email, password);
    await flush(400);
    const loginSession = await loginPromise;

    const mePromise = service.getUserMe();
    await flush();
    const me = await mePromise;

    expect(me.id).toBe(loginSession.user.id);
    expect(me.email).toBe(email);
    expect(me.username).toBe('session-user');
  });

it('getPublicUserByUsername throws for non-existent username', async () => {
  jest.useRealTimers();
  
  await expect(
    service.getPublicUserByUsername('this-user-does-not-exist')
  ).rejects.toThrow('User not found');
});

it.skip('getPublicUserByUsername throws for private profile', async () => {
  jest.useRealTimers();
  
  const { getMockUsersStore } = await import('@/services/mocks/mockSystemStore');
  const users = getMockUsersStore();
  const mockartist = users.find((u) => u.username === 'mockartist');
  if (!mockartist) throw new Error('seed user mockartist not found');

  mockartist.privacySettings.isPrivate = true;

  await expect(
    service.getPublicUserByUsername('mockartist')
  ).rejects.toThrow('User not found');

  mockartist.privacySettings.isPrivate = false;
});

});
