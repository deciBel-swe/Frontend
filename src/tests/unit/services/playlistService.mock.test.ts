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
    });
    await advance();
    const created = await createPromise;

    const linkPromise = service.getPlaylistSecretLink(created.id);
    await advance();
    const link = await linkPromise;
    expect(link.SecretLink.length).toBeGreaterThan(0);

    const regenPromise = service.regeneratePlaylistSecretLink(created.id);
    await advance();
    const regenerated = await regenPromise;
    expect(regenerated.secretUrl).toContain('/playlists/token/');

    const token = regenerated.secretUrl.split('/').pop() ?? '';
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
    });
    await advance();
    const created = await createPromise;

    const addFirstPromise = service.addTrackToPlaylist(created.id, {
      trackId: 101,
    });
    await advance();
    await addFirstPromise;

    const addSecondPromise = service.addTrackToPlaylist(created.id, {
      trackId: 102,
    });
    await advance();
    await addSecondPromise;

    const reorderedPromise = service.reorderPlaylistTracks(created.id, {
      trackIds: [102, 101],
    });
    await advance();
    const reordered = await reorderedPromise;
    expect(reordered.tracks?.[0]?.trackId).toBe(102);

    const removePromise = service.removeTrackFromPlaylist(created.id, 102);
    await advance();
    await removePromise;

    const afterRemovePromise = service.getPlaylist(created.id);
    await advance();
    const afterRemove = await afterRemovePromise;
    expect(afterRemove.tracks?.some((track) => track.trackId === 102)).toBe(
      false
    );
  });

  it('likes and unlikes a playlist', async () => {
    const service = new MockPlaylistService();

    const createPromise = service.createPlaylist({
      title: 'Like Me',
      description: '',
      type: 'PLAYLIST',
      isPrivate: false,
      CoverArt: '',
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

  it('returns embed code for a playlist', async () => {
    const service = new MockPlaylistService();

    const createPromise = service.createPlaylist({
      title: 'Embed Me',
      description: '',
      type: 'PLAYLIST',
      isPrivate: false,
      CoverArt: '',
    });
    await advance();
    const created = await createPromise;

    const embedPromise = service.getPlaylistEmbed(created.id);
    await advance();
    const embed = await embedPromise;
    expect(embed.embedCode).toContain('<iframe');
  });
});
