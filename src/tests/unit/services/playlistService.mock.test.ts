export {};

type MockPlaylistServiceCtor =
  typeof import('@/services/mocks/playlistService').MockPlaylistService;

const MOCK_PLAYLIST_SYSTEM_KEY = 'decibel_mock_system_state_v1';

const advance = async (ms = 400) => {
  await jest.advanceTimersByTimeAsync(ms);
};

describe('MockPlaylistService', () => {
  let MockPlaylistService: MockPlaylistServiceCtor;
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

    ({ MockPlaylistService } = await import('@/services/mocks/playlistService'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a playlist and persists it to mock storage', async () => {
    const service = new MockPlaylistService();

    const createPromise = service.createPlaylist({
      title: 'Midnight Drives',
      description: 'City lights and synths',
      type: 'PLAYLIST',
      isPrivate: false,
      CoverArt: '',
      genre: 'Electronic',
    });

    await advance();
    const created = await createPromise;

    expect(created.title).toBe('Midnight Drives');
    expect(created.type).toBe('PLAYLIST');
    expect(created.isLiked).toBe(false);
    expect(created.owner).toBeDefined();

    const persistedRaw = storage.get(MOCK_PLAYLIST_SYSTEM_KEY);
    expect(persistedRaw).toBeTruthy();
    expect(persistedRaw).toContain('Midnight Drives');
  });

  it('updates and deletes a playlist', async () => {
    const service = new MockPlaylistService();

    const createPromise = service.createPlaylist({
      title: 'Update Me',
      description: '',
      type: 'PLAYLIST',
      isPrivate: false,
      CoverArt: '',
      genre: 'Electronic',
    });
    await advance();
    const created = await createPromise;

    const updatedPromise = service.updatePlaylist(created.id, {
      title: 'Updated',
      description: 'New description',
      type: 'ALBUM',
      isPrivate: true,
      CoverArt: '',
    });
    await advance();
    const updated = await updatedPromise;

    expect(updated.title).toBe('Updated');
    expect(updated.type).toBe('ALBUM');

    const deletePromise = service.deletePlaylist(created.id);
    await advance();
    await deletePromise;

    const missingPromise = service.getPlaylist(created.id);
    const missingExpectation = expect(missingPromise).rejects.toThrow(
      'Playlist not found'
    );
    await advance();
    await missingExpectation;
  });

  it('handles secret links and token access', async () => {
    const service = new MockPlaylistService();

    const createPromise = service.createPlaylist({
      title: 'Secret Set',
      description: '',
      type: 'PLAYLIST',
      isPrivate: true,
      CoverArt: '',
      genre: 'Electronic',
    });
    await advance();
    const created = await createPromise;

    const linkPromise = service.getPlaylistSecretLink(created.id);
    await advance();
    const link = await linkPromise;
    expect(link.secretToken.length).toBeGreaterThan(0);

    const regenPromise = service.regeneratePlaylistSecretLink(created.id);
    await advance();
    const regenerated = await regenPromise;
    expect((regenerated.secretToken ?? '').length).toBeGreaterThan(0);
    expect(regenerated.secretUrl).toContain('/playlists/token/');

    const token = regenerated.secretUrl?.split('/').pop() ?? '';
    const byTokenPromise = service.getPlaylistByToken(token);
    await advance();
    const byToken = await byTokenPromise;
    expect(byToken.id).toBe(created.id);
  });

  it('reorders tracks and manages playlist tracks', async () => {
    const service = new MockPlaylistService();

    const createPromise = service.createPlaylist({
      title: 'Track Ops',
      description: '',
      type: 'PLAYLIST',
      isPrivate: false,
      CoverArt: '',
      genre: 'Electronic',
    });
    await advance();
    const created = await createPromise;

    const addFirstPromise = service.addTrackToPlaylist(created.id, {
      trackId: 1001,
    });
    await advance();
    const addFirstResult = await addFirstPromise;
    expect(addFirstResult.id).toBe(created.id);
    expect(addFirstResult.tracks?.length).toBeGreaterThan(0);

    const addSecondPromise = service.addTrackToPlaylist(created.id, {
      trackId: 1002,
    });
    await advance();
    await addSecondPromise;

    const reorderedPromise = service.reorderPlaylistTracks(created.id, {
      trackIds: [1002, 1001],
    });
    await advance();
    const reordered = await reorderedPromise;
    const reorderedFirstTrack = reordered.tracks?.[0];
    const reorderedFirstTrackId = reorderedFirstTrack
      ? 'id' in reorderedFirstTrack
        ? reorderedFirstTrack.id
        : reorderedFirstTrack.trackId
      : undefined;
    expect(reorderedFirstTrackId).toBe(1002);

    const removePromise = service.removeTrackFromPlaylist(created.id, 1002);
    await advance();
    await removePromise;

    const afterRemovePromise = service.getPlaylist(created.id);
    await advance();
    const afterRemove = await afterRemovePromise;
    const hasRemovedTrack = afterRemove.tracks?.some((track) => {
      const trackId = 'id' in track ? track.id : track.trackId;
      return trackId === 1002;
    });
    expect(hasRemovedTrack).toBe(false);
  });

  it('likes and unlikes a playlist', async () => {
    const service = new MockPlaylistService();

    const createPromise = service.createPlaylist({
      title: 'Like Me',
      description: '',
      type: 'PLAYLIST',
      isPrivate: false,
      CoverArt: '',
      genre: 'Electronic',
    });
    await advance();
    const created = await createPromise;

    const likePromise = service.likePlaylist(created.id);
    await advance();
    const liked = await likePromise;
    expect(liked.isLiked).toBe(true);

    const unlikePromise = service.unlikePlaylist(created.id);
    await advance();
    const unliked = await unlikePromise;
    expect(unliked.isLiked).toBe(false);
  });

  it('reposts and unreposts a playlist', async () => {
    const service = new MockPlaylistService();

    const createPromise = service.createPlaylist({
      title: 'Repost Me',
      description: '',
      type: 'PLAYLIST',
      isPrivate: false,
      CoverArt: '',
      genre: 'Electronic',
    });
    await advance();
    const created = await createPromise;

    const repostPromise = service.repostPlaylist(created.id);
    await advance();
    const reposted = await repostPromise;
    expect(reposted.isReposted).toBe(true);

    const unrepostPromise = service.unrepostPlaylist(created.id);
    await advance();
    const unreposted = await unrepostPromise;
    expect(unreposted.isReposted).toBe(false);
  });

  it('returns embed code for a playlist', async () => {
    const service = new MockPlaylistService();

    const createPromise = service.createPlaylist({
      title: 'Embed Me',
      description: '',
      type: 'PLAYLIST',
      isPrivate: false,
      CoverArt: '',
      genre: 'Electronic',
    });
    await advance();
    const created = await createPromise;

    const embedPromise = service.getPlaylistEmbed(created.id);
    await advance();
    const embed = await embedPromise;
    expect(embed.embedCode).toContain('<iframe');
  });

  it('returns paginated playlist tracks and resolves playlist slugs', async () => {
    const service = new MockPlaylistService();

    const createPromise = service.createPlaylist({
      title: 'Slug Playlist',
      description: '',
      type: 'PLAYLIST',
      isPrivate: false,
      CoverArt: '',
      genre: 'Electronic',
    });
    await advance();
    const created = await createPromise;

    const addTrackPromise = service.addTrackToPlaylist(created.id, {
      trackId: 1001,
    });
    await advance();
    await addTrackPromise;

    const tracksPagePromise = service.getPlaylistTracks(created.id, {
      page: 0,
      size: 10,
    });
    await advance();
    const tracksPage = await tracksPagePromise;
    expect(tracksPage.content.length).toBe(1);
    expect(tracksPage.content[0].id).toBe(1001);

    const resolvePromise = service.resolvePlaylistSlug(created.playlistSlug ?? '');
    await advance();
    const resolved = await resolvePromise;
    expect(resolved).toEqual({
      type: 'PLAYLIST',
      id: created.id,
    });
  });

  it('returns paginated user, me, and liked playlist listings', async () => {
    const service = new MockPlaylistService();

    const myPlaylistsPromise = service.getMePlaylists({ page: 0, size: 5 });
    await advance();
    const myPlaylists = await myPlaylistsPromise;
    expect(Array.isArray(myPlaylists.content)).toBe(true);
    expect(myPlaylists.pageSize).toBe(5);

    const userPlaylistsPromise = service.getUserPlaylists('user001', {
      page: 0,
      size: 5,
    });
    await advance();
    const userPlaylists = await userPlaylistsPromise;
    expect(Array.isArray(userPlaylists.content)).toBe(true);
    expect(userPlaylists.pageSize).toBe(5);

    const likedPlaylistsPromise = service.getUserLikedPlaylists('user002', {
      page: 0,
      size: 5,
    });
    await advance();
    const likedPlaylists = await likedPlaylistsPromise;
    expect(Array.isArray(likedPlaylists.content)).toBe(true);
    expect(likedPlaylists.pageSize).toBe(5);
  });
});
