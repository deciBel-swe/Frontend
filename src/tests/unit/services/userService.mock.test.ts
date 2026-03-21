import { MockUserService } from '@/services/mocks/userService';

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

  it('returns public profile and me payload', async () => {
    const publicPromise = service.getPublicUser('mockuser');
    await flush();
    const publicUser = await publicPromise;

    expect(publicUser.username).toBe('mockuser');
    expect(publicUser.stats.trackCount).toBeGreaterThan(0);

    const mePromise = service.getUserMe('token-1');
    await flush();
    const me = await mePromise;

    expect(me.username).toBe('mockuser');
    expect(me.socialLinks.supportLink).toContain('support');
  });

  it('updates profile and social links', async () => {
    const updatePromise = service.updateMe('token-1', {
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
    const followPromise = service.followUser('token-1', '3');
    await flush();
    const followed = await followPromise;

    expect(followed.isFollowing).toBe(true);

    const followingListPromise = service.getFollowing('token-1', '1', {
      page: 0,
      size: 10,
    });
    await flush();
    const followingList = await followingListPromise;

    expect(followingList.content.some((user) => user.id === 3)).toBe(true);

    const blockPromise = service.blockUser('token-1', '3');
    await flush();
    const blocked = await blockPromise;
    expect(blocked.message).toContain('Blocked');

    const blockedListPromise = service.getBlockedUsers('token-1', {
      page: 0,
      size: 10,
    });
    await flush();
    const blockedList = await blockedListPromise;
    expect(blockedList.content.some((user) => user.id === 3)).toBe(true);

    const unblockPromise = service.unblockUser('token-1', '3');
    await flush();
    const unblocked = await unblockPromise;
    expect(unblocked.message).toContain('Unblocked');

    const unfollowPromise = service.unfollowUser('token-1', '3');
    await flush();
    const unfollowed = await unfollowPromise;
    expect(unfollowed.isFollowing).toBe(false);
  });

  it('returns paginated history and tracks', async () => {
    const historyPromise = service.getHistory('token-1', { page: 0, size: 2 });
    await flush();
    const history = await historyPromise;

    expect(history.content).toHaveLength(2);
    expect(history.pageSize).toBe(2);

    const tracksPromise = service.getUserTracks('1', { page: 0, size: 2 });
    await flush();
    const tracks = await tracksPromise;

    expect(tracks.content).toHaveLength(2);
    expect(tracks.totalElements).toBeGreaterThanOrEqual(2);
  });

  it('updates account security and tier data', async () => {
    const addEmailPromise = service.addNewEmail('token-1', {
      newEmail: 'new@mail.com',
    });
    await flush();
    const addEmail = await addEmailPromise;
    expect(addEmail.message).toBe('Email added');

    const primaryEmailPromise = service.updatePrimaryEmail('token-1', {
      newEmail: 'primary@mail.com',
    });
    await flush();
    const primaryEmail = await primaryEmailPromise;
    expect(primaryEmail.message).toContain('Primary email');

    const tierPromise = service.updateTier('token-1', {
      newTier: 'ARTIST_PRO',
    });
    await flush();
    const tier = await tierPromise;
    expect(tier.tier).toBe('ARTIST_PRO');
  });
});
