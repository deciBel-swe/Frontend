export {};

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
    storage.set('user', JSON.stringify({ id: 7, username: 'service-tester' }));

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

  it('updates track fields and clears cover when removeCover is true', async () => {
    const service = new MockTrackService();

    const formData = new FormData();
    formData.append('title', 'Updated Neon Skylines');
    formData.append('genre', 'Downtempo');
    formData.append('description', '');
    formData.append('tags', 'late-night,focus');
    formData.append('isPrivate', 'false');
    formData.append('removeCover', 'true');

    const updatePromise = service.updateTrack(101, formData);
    await advance(1200);
    const updated = await updatePromise;

    expect(updated.title).toBe('Updated Neon Skylines');
    expect(updated.genre).toBe('Downtempo');
    expect(updated.description).toBe('');
    expect(updated.tags).toEqual(['late-night', 'focus']);

    const metadataPromise = service.getTrackMetadata(101);
    await advance(400);
    const metadata = await metadataPromise;

    expect(metadata.title).toBe('Updated Neon Skylines');
    expect(metadata.coverUrl).toContain('decibel-cover-101');
  });

  it('deletes tracks and rejects reads for deleted ids', async () => {
    const service = new MockTrackService();

    const allBeforePromise = service.getAllTracks();
    await advance(400);
    const allBefore = await allBeforePromise;

    expect(allBefore.some((track) => track.id === 105)).toBe(true);

    const deletePromise = service.deleteTrack(105);
    await advance(1200);
    await deletePromise;

    const allAfterPromise = service.getAllTracks();
    await advance(400);
    const allAfter = await allAfterPromise;

    expect(allAfter.some((track) => track.id === 105)).toBe(false);

    const missingRead = expect(service.getTrackMetadata(105)).rejects.toThrow(
      'Track not found'
    );
    await advance(400);
    await missingRead;
  });

  it('returns paginated metadata for liked and reposted track lists', async () => {
    const service = new MockTrackService();

    storage.set('user', JSON.stringify({ id: 1, username: 'mockuser' }));

    const likedPromise = service.getMyLikedTracks({ page: 2, size: 1 });
    await advance(1200);
    const liked = await likedPromise;

    expect(liked.pageNumber).toBe(2);
    expect(liked.pageSize).toBe(1);
    expect(liked.totalElements).toBeGreaterThanOrEqual(1);

    const repostedPromise = service.getMyRepostedTracks();
    await advance(1200);
    const reposted = await repostedPromise;

    expect(reposted.pageNumber).toBe(0);
    expect(reposted.totalElements).toBeGreaterThanOrEqual(1);
    expect((reposted.content ?? []).every((track) => track.isReposted)).toBe(true);
  });

  it('covers error branches for like and repost operations', async () => {
    const service = new MockTrackService();

    const missingTrackLike = expect(service.likeTrack(999999)).rejects.toThrow(
      'Track not found'
    );
    await advance(1200);
    await missingTrackLike;

    storage.set('user', JSON.stringify({ id: 999, username: 'ghost' }));

    const missingUserRepost = expect(service.repostTrack(101)).rejects.toThrow(
      'User not found'
    );
    await advance(1200);
    await missingUserRepost;

    storage.set('user', JSON.stringify({ id: 1, username: 'mockuser' }));

    const duplicateRepost = expect(service.repostTrack(204)).rejects.toThrow(
      'Track already reposted by user'
    );
    await advance(1200);
    await duplicateRepost;

    const missingUserUnrepost = expect(service.unrepostTrack(101)).rejects.toThrow(
      'Track not reposted by user'
    );
    await advance(1200);
    await missingUserUnrepost;
  });

  it('handles malformed upload waveform json and falls back to default artist when session user is unknown', async () => {
    const service = new MockTrackService();

    storage.set('user', JSON.stringify({ id: 999, username: 'ghost-user' }));

    const formData = new FormData();
    formData.append('title', 'Malformed Waveform Upload');
    formData.append('waveformData', '[0.1,0.2');

    const uploadPromise = service.uploadTrack(formData, jest.fn());
    await advance();
    const uploaded = await uploadPromise;

    expect(uploaded.durationSeconds).toBe(180);

    const metadataPromise = service.getTrackMetadata(uploaded.id);
    await advance(400);
    const metadata = await metadataPromise;

    expect(metadata.artist.id).toBe(7);
    expect(metadata.artist.username).toBe('mockartist');
  });

  it('supports repost-user pagination defaults and zero-size page requests', async () => {
    const service = new MockTrackService();

    const defaultPagePromise = service.getRepostUsers(201);
    await advance(1200);
    const defaultPage = await defaultPagePromise;

    expect(defaultPage.pageNumber).toBe(0);
    expect(defaultPage.pageSize).toBeGreaterThanOrEqual(1);

    const zeroSizePromise = service.getRepostUsers(201, { page: 0, size: 0 });
    await advance(1200);
    const zeroSize = await zeroSizePromise;

    expect(zeroSize.pageSize).toBe(0);
    expect(zeroSize.totalPages).toBe(0);
    expect(zeroSize.isLast).toBe(true);
  });

  it('rejects visibility and cover operations for missing tracks', async () => {
    const service = new MockTrackService();

    const missingVisibility = expect(service.getTrackVisibility(999999)).rejects.toThrow(
      'Track not found'
    );
    await advance(400);
    await missingVisibility;

    const missingCoverDelete = expect(service.deleteTrackCover(999999)).rejects.toThrow(
      'Track not found'
    );
    await advance(400);
    await missingCoverDelete;
  });

  it('parses optional update fields when boolean inputs are invalid strings', async () => {
    const service = new MockTrackService();

    const formData = new FormData();
    formData.append('description', '   ');
    formData.append('isPrivate', 'maybe');
    formData.append('removeCover', 'maybe');

    const updatePromise = service.updateTrack(101, formData);
    await advance(1200);
    const updated = await updatePromise;

    expect(updated.id).toBe(101);
    expect(updated.description).toBe('');
    expect(updated.isPrivate).toBe(false);
  });

  it('supports unlike when user record is absent and covers repost auth/user failures', async () => {
    const service = new MockTrackService();

    storage.set('user', JSON.stringify({ id: 999, username: 'ghost-user' }));

    const unlikePromise = service.unlikeTrack(106);
    await advance(1200);
    const unlikeResponse = await unlikePromise;

    expect(unlikeResponse).toEqual({
      isLiked: false,
      message: 'Track unliked successfully',
    });

    storage.set('user', JSON.stringify({ id: 0, username: 'zero-user' }));
    const unauthenticatedRepost = expect(service.repostTrack(101)).rejects.toThrow(
      'User not authenticated'
    );
    await advance(1200);
    await unauthenticatedRepost;

    storage.set('user', JSON.stringify({ id: 999, username: 'ghost-user' }));
    const missingUserUnrepost = expect(service.unrepostTrack(101)).rejects.toThrow(
      'User not found'
    );
    await advance(1200);
    await missingUserUnrepost;
  });

  it('uses upload fallbacks for empty stores, custom URLs, JSON tags, and cover image files', async () => {
    const { replaceMockTracksStore } = await import('@/services/mocks/mockSystemStore');
    replaceMockTracksStore([]);

    const service = new MockTrackService();

    const formData = new FormData();
    formData.append('title', new File(['ignored-title'], 'title.txt'));
    formData.append('genre', '   ');
    formData.append('description', '   ');
    formData.append('trackUrl', 'https://cdn.decibel.test/custom-upload.mp3');
    formData.append('waveformData', '[0.1,0.2,0.3]');
    formData.append('tags', '[" synth ","","synth"]');
    formData.append(
      'coverImage',
      new File(['cover-bytes'], 'cover.png', { type: 'image/png' })
    );

    const uploadPromise = service.uploadTrack(formData, jest.fn());
    await advance();
    const uploaded = await uploadPromise;

    expect(uploaded.id).toBe(1);
    expect(uploaded.trackUrl).toBe('https://cdn.decibel.test/custom-upload.mp3');
    expect(uploaded.durationSeconds).toBe(30);

    const metadataPromise = service.getTrackMetadata(uploaded.id);
    await advance(400);
    const metadata = await metadataPromise;

    expect(metadata.title).toMatch(/^Untitled/);
    expect(metadata.genre).toBe('Electronic');
    expect(metadata.tags).toEqual(['synth']);
    expect(metadata.waveformData).toEqual([0.1, 0.2, 0.3]);
    expect(metadata.coverUrl.startsWith('data:')).toBe(true);
  });

  it('handles empty waveform uploads and default liked-track pagination when params are omitted', async () => {
    const service = new MockTrackService();

    const formData = new FormData();
    formData.append('title', 'Empty Waveform Upload');
    formData.append('waveformData', '');

    const uploadPromise = service.uploadTrack(formData, jest.fn());
    await advance();
    const uploaded = await uploadPromise;

    const metadataPromise = service.getTrackMetadata(uploaded.id);
    await advance(400);
    const metadata = await metadataPromise;

    expect(uploaded.durationSeconds).toBe(30);
    expect(metadata.waveformData).toEqual([]);

    storage.set('user', JSON.stringify({ id: 1, username: 'mockuser' }));
    const likedPromise = service.getMyLikedTracks();
    await advance(1200);
    const liked = await likedPromise;

    expect(liked.pageNumber).toBe(0);
    expect(liked.pageSize).toBe((liked.content ?? []).length);
  });

  it('rejects missing-track operations across update, delete, token, and engagement endpoints', async () => {
    const service = new MockTrackService();
    storage.set('user', JSON.stringify({ id: 1, username: 'mockuser' }));

    const missingUpdate = expect(
      service.updateTrack(999999, new FormData())
    ).rejects.toThrow('Track not found');
    await advance(1200);
    await missingUpdate;

    const missingDelete = expect(service.deleteTrack(999999)).rejects.toThrow(
      'Track not found'
    );
    await advance(1200);
    await missingDelete;

    const missingSecret = expect(service.getSecretLink('999999')).rejects.toThrow(
      'Track not found'
    );
    await advance(400);
    await missingSecret;

    const missingSecretRotation = expect(
      service.regenerateSecretLink('999999')
    ).rejects.toThrow('Track not found');
    await advance(400);
    await missingSecretRotation;

    const missingUnlike = expect(service.unlikeTrack(999999)).rejects.toThrow(
      'Track not found'
    );
    await advance(1200);
    await missingUnlike;

    const missingRepost = expect(service.repostTrack(999999)).rejects.toThrow(
      'Track not found'
    );
    await advance(1200);
    await missingRepost;

    const missingUnrepost = expect(service.unrepostTrack(999999)).rejects.toThrow(
      'Track not found'
    );
    await advance(1200);
    await missingUnrepost;
  });

  it('covers optional update parsers with non-string fields and visibility secret-link branches', async () => {
    const service = new MockTrackService();

    const formData = new FormData();
    formData.append('title', new File(['ignored-title'], 'title.txt'));
    formData.append('genre', '   ');
    formData.append('isPrivate', 'true');
    formData.append('removeCover', new File(['ignored-remove'], 'remove.txt'));
    formData.append('artist', 'renamed-artist');
    formData.append('tags', new File(['ignored-tag'], 'tag.bin'));
    formData.append(
      'coverImage',
      new File(['cover-bytes-2'], 'cover-2.png', { type: 'image/png' })
    );

    const updatePromise = service.updateTrack(101, formData);
    await advance(1200);
    const updated = await updatePromise;

    expect(updated.id).toBe(101);
    expect(updated.isPrivate).toBe(true);
    expect(updated.tags).toEqual([]);

    const metadataPromise = service.getTrackMetadata(101);
    await advance(400);
    const metadata = await metadataPromise;

    expect(metadata.artist.username.length).toBeGreaterThan(0);
    expect(metadata.coverUrl.startsWith('data:')).toBe(true);

    const secretPromise = service.getSecretLink('101');
    await advance(400);
    const secret = await secretPromise;
    expect(secret.secretLink.length).toBeGreaterThan(0);

    const visibleAgainPromise = service.updateTrackVisibility(101, {
      isPrivate: false,
    });
    await advance(400);
    const visibleAgain = await visibleAgainPromise;
    expect(visibleAgain).toEqual({ isPrivate: false });
  });

  it('uses default repost pagination page size when no repost users exist', async () => {
    const service = new MockTrackService();

    const pagePromise = service.getRepostUsers(999999);
    await advance(1200);
    const page = await pagePromise;

    expect(page.totalElements).toBe(0);
    expect(page.totalPages).toBe(0);
    expect(page.pageSize).toBe(20);
    expect(page.isLast).toBe(true);
  });
});
