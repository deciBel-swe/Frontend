import { MockFeedService } from '@/services/mocks/feedService';
import {
  flushMockLocalStorage,
  getMockUsersStore,
} from '@/services/mocks/mockSystemStore';

describe('MockFeedService', () => {
  let service: MockFeedService;

  beforeEach(() => {
    jest.clearAllMocks();
    flushMockLocalStorage();
    service = new MockFeedService();
  });

  it('returns only followed users tracks', async () => {
    const users = getMockUsersStore();
    const me = users.find((user) => user.id === 1);
    if (!me) throw new Error('seed user 1 not found');

    me.following.add(7);
    me.blocked.delete(7);

    const feed = await service.getfeed({ page: 0, size: 20 });

    expect(feed.content?.length).toBeGreaterThan(0);

    const followedUsers = users.filter((user) => me.following.has(user.id));
    const followedUserIds = new Set(followedUsers.map((user) => user.id));
    const followedUsernames = new Set(
      followedUsers.map((user) => user.username.toLowerCase())
    );

    const allFromFollowed = (feed.content ?? []).every((track) => {
      const artistId = track.artist.id;
      const artistUsername = (track.artist.username ?? '').toLowerCase();
      return (
        (typeof artistId === 'number' && followedUserIds.has(artistId)) ||
        followedUsernames.has(artistUsername)
      );
    });

    expect(allFromFollowed).toBe(true);
  });

  it('excludes blocked users tracks even if they are followed', async () => {
    const users = getMockUsersStore();
    const me = users.find((user) => user.id === 1);
    if (!me) throw new Error('seed user 1 not found');

    me.following.add(7);
    me.blocked.add(7);

    const feed = await service.getfeed({ page: 0, size: 20 });

    const hasBlockedArtistTrack = (feed.content ?? []).some(
      (track) => track.artist.id === 7 || track.artist.username === 'mockartist'
    );

    expect(hasBlockedArtistTrack).toBe(false);
  });

  it('returns paginated feed metadata', async () => {
    const users = getMockUsersStore();
    const me = users.find((user) => user.id === 1);
    if (!me) throw new Error('seed user 1 not found');

    me.following.add(7);
    me.blocked.delete(7);

    const feed = await service.getfeed({ page: 0, size: 1 });

    expect(feed.pageNumber).toBe(0);
    expect(feed.pageSize).toBe(1);
    expect(feed.totalElements).toBeGreaterThanOrEqual(1);
    expect(feed.totalPages).toBeGreaterThanOrEqual(1);
    expect(feed.content).toHaveLength(1);
  });
});
