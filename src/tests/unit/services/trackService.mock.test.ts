type MockTrackServiceCtor =
  typeof import('@/services/mocks/trackService').MockTrackService;

const TRACKS_KEY = 'decibel_mock_tracks';

const advance = async (ms = 2500) => {
  await jest.advanceTimersByTimeAsync(ms);
};

describe('MockTrackService', () => {
  let MockTrackService: MockTrackServiceCtor;
  const storage = new Map<string, string>();

  const bindStorageDouble = () => {
    const localStorageDouble = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
    } as Storage;

    Object.defineProperty(window, 'localStorage', {
      value: localStorageDouble,
      configurable: true,
    });

    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageDouble,
      configurable: true,
    });
  };

  beforeEach(async () => {
    jest.resetModules();
    jest.useFakeTimers();

    storage.clear();
    bindStorageDouble();

    ({ MockTrackService } = await import('@/services/mocks/trackService'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uploads a track, emits progress, and persists to storage', async () => {
    const service = new MockTrackService();

    const formData = new FormData();
    formData.append('title', 'Service Upload Test');
    formData.append('genre', 'Ambient');
    formData.append('artist', 'service-tester');
    formData.append('isPrivate', 'true');
    formData.append('tags', 'test,upload');
    formData.append('waveformData', '0.1');
    formData.append('waveformData', '0.2');

    const onProgress = jest.fn();

    const uploadPromise = service.uploadTrack(formData, onProgress);
    await advance();
    const uploaded = await uploadPromise;

    expect(onProgress).toHaveBeenCalledWith(100);
    expect(uploaded.title).toBe('Service Upload Test');
    expect(uploaded.durationSeconds).toBeGreaterThanOrEqual(30);

    const persistedRaw = storage.get(TRACKS_KEY);
    expect(persistedRaw).toBeTruthy();
    expect(persistedRaw).toContain('Service Upload Test');

    // Simulate logged-in session as user 7 so getUserTracks shows private tracks
    storage.set(
      'decibel_mock_user',
      JSON.stringify({ id: 7, username: 'service-tester' })
    );

    const tracksPromise = service.getUserTracks(7);
    await advance(400);
    const tracks = await tracksPromise;

    expect(tracks.some((track) => track.id === uploaded.id)).toBe(true);
  });

  it('reads and updates visibility state', async () => {
    const service = new MockTrackService();

    const initialPromise = service.getTrackVisibility(101);
    await advance(400);
    const initial = await initialPromise;
    expect(initial).toEqual({ isPrivate: false });

    const updatedPromise = service.updateTrackVisibility(101, {
      isPrivate: true,
    });
    await advance(400);
    const updated = await updatedPromise;
    expect(updated).toEqual({ isPrivate: true });

    const reloadedPromise = service.getTrackVisibility(101);
    await advance(400);
    const reloaded = await reloadedPromise;
    expect(reloaded).toEqual({ isPrivate: true });
  });

  it('generates and regenerates secret links consistently', async () => {
    const service = new MockTrackService();

    const firstPromise = service.getSecretLink('103');
    await advance(400);
    const first = await firstPromise;

    const secondPromise = service.getSecretLink('103');
    await advance(400);
    const second = await secondPromise;

    expect(first.secretLink.length).toBeGreaterThan(0);
    expect(second.secretLink).toBe(first.secretLink);

    const regeneratedPromise = service.regenerateSecretLink('103');
    await advance(400);
    const regenerated = await regeneratedPromise;

    expect(regenerated.secretLink).not.toBe(first.secretLink);
  });

  it('throws for invalid and missing track references', async () => {
    const service = new MockTrackService();

    const invalidIdExpectation = expect(
      service.getSecretLink('not-a-number')
    ).rejects.toThrow('Invalid track id');

    await advance(400);
    await invalidIdExpectation;

    const missingTrackExpectation = expect(
      service.updateTrackVisibility(999999, {
        isPrivate: true,
      })
    ).rejects.toThrow('Track not found');

    await advance(400);
    await missingTrackExpectation;
  });
  it('getAllTracks does not include private tracks', async () => {
    const service = new MockTrackService();

    // seed track 102 is private (Cloud Room Sessions)
    const allPromise = service.getAllTracks();
    await advance(400);
    const all = await allPromise;

    expect(all.every((track) => !(track as any).isPrivate)).toBe(true);
    expect(all.find((t) => t.id === 102)).toBeUndefined();
  });

  it('getUserTracks hides private tracks from non-owners', async () => {
    const service = new MockTrackService();

    // No session set — resolveCurrentMockUserId returns a default that is not 7
    // so the caller is treated as a visitor, not the owner
    const tracksPromise = service.getUserTracks(7);
    await advance(400);
    const tracks = await tracksPromise;

    // seed track 102 (Cloud Room Sessions) belongs to user 7 and is private
    expect(tracks.find((t) => t.id === 102)).toBeUndefined();
  });

  it('getRepostUsers returns paginated repost users with follow state', async () => {
    const service = new MockTrackService();

    // Default current user id resolves to 1 in tests when no session is set.
    // Track 201 is reposted by user 2 in seed data, and user 2 is followed by user 1.
    const repostUsersPromise = service.getRepostUsers(201, {
      page: 0,
      size: 10,
    });
    await advance(1200);
    const repostUsers = await repostUsersPromise;

    expect(repostUsers.pageNumber).toBe(0);
    expect(repostUsers.pageSize).toBe(10);
    expect(repostUsers.totalElements).toBeGreaterThanOrEqual(1);
    expect(repostUsers.totalPages).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(repostUsers.content)).toBe(true);

    const match = repostUsers.content?.find((user) => user.id === 2);
    expect(match).toBeTruthy();
    expect(match?.username).toBe('listenertwo');
    expect(match?.isFollowing).toBe(true);
    expect(match?.tier).toBe('FREE');
  });

  it('likeTrack adds current user like and returns success response', async () => {
    const service = new MockTrackService();

    storage.set(
      'decibel_mock_user',
      JSON.stringify({ id: 1, username: 'mockuser' })
    );

    const likePromise = service.likeTrack(106);
    await advance(1200);
    const response = await likePromise;

    expect(response).toEqual({
      isLiked: true,
      message: 'Track liked successfully',
    });

    const repostUsersPromise = service.getRepostUsers(203, {
      page: 0,
      size: 10,
    });
    await advance(1200);
    await repostUsersPromise;

    const persistedRaw = storage.get(TRACKS_KEY);
    expect(persistedRaw).toBeTruthy();
    expect(persistedRaw).toContain('106');
  });

  it('unlikeTrack removes current user like and returns success response', async () => {
    const service = new MockTrackService();

    storage.set(
      'decibel_mock_user',
      JSON.stringify({ id: 1, username: 'mockuser' })
    );

    const likePromise = service.likeTrack(106);
    await advance(1200);
    await likePromise;

    const unlikePromise = service.unlikeTrack(106);
    await advance(1200);
    const response = await unlikePromise;

    expect(response).toEqual({
      isLiked: false,
      message: 'Track unliked successfully',
    });
  });

  it('repostTrack adds repost for current user and returns success response', async () => {
    const service = new MockTrackService();

    storage.set(
      'decibel_mock_user',
      JSON.stringify({ id: 1, username: 'mockuser' })
    );

    const repostPromise = service.repostTrack(101);
    await advance(1200);
    const response = await repostPromise;

    expect(response).toEqual({
      isReposted: true,
      message: 'Track reposted successfully',
    });
  });

  it('unrepostTrack removes repost for current user and returns success response', async () => {
    const service = new MockTrackService();

    storage.set(
      'decibel_mock_user',
      JSON.stringify({ id: 1, username: 'mockuser' })
    );

    const unrepostPromise = service.unrepostTrack(204);
    await advance(1200);
    const response = await unrepostPromise;

    expect(response).toEqual({
      isReposted: false,
      message: 'Track unreposted successfully',
    });
  });
});
