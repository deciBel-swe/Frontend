export {};

type MockCommentServiceCtor =
  typeof import('@/services/mocks/commentService').MockCommentService;

const MOCK_SYSTEM_KEY = 'decibel_mock_system_state_v1';

const advance = async (ms = 400) => {
  await jest.advanceTimersByTimeAsync(ms);
};

describe('MockCommentService', () => {
  let MockCommentService: MockCommentServiceCtor;
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

    ({ MockCommentService } = await import('@/services/mocks/commentService'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('lists comments with timestamps for a track', async () => {
    const service = new MockCommentService();

    const listPromise = service.getTrackComments(101, { page: 0, size: 10 });
    await advance();
    const list = await listPromise;

    expect(list.content.length).toBeGreaterThan(0);
    expect(list.content[0].timestampSeconds).toBeDefined();
  });

  it('adds a comment and persists it', async () => {
    const service = new MockCommentService();

    const addPromise = service.addTrackComment(101, {
      body: 'Great track',
      timestampSeconds: 12,
    });
    await advance();
    const added = await addPromise;

    expect(added.body).toBe('Great track');
    expect(added.timestampSeconds).toBe(12);

    const persistedRaw = storage.get(MOCK_SYSTEM_KEY);
    expect(persistedRaw).toBeTruthy();
    expect(persistedRaw).toContain('Great track');
  });

  it('lists replies for a comment', async () => {
    const service = new MockCommentService();

    const repliesPromise = service.getCommentReplies(1001, {
      page: 0,
      size: 10,
    });
    await advance();
    const replies = await repliesPromise;

    expect(replies.content.length).toBeGreaterThan(0);
    expect('timestampSeconds' in replies.content[0]).toBe(false);
  });

  it('deletes a comment and its replies', async () => {
    const service = new MockCommentService();

    const deletePromise = service.deleteComment(1001);
    await advance();
    await deletePromise;

    const listPromise = service.getTrackComments(101, { page: 0, size: 10 });
    await advance();
    const list = await listPromise;
    expect(list.content.some((comment) => comment.id === 1001)).toBe(false);

    const repliesPromise = service.getCommentReplies(1001, {
      page: 0,
      size: 10,
    });
    await advance();
    const replies = await repliesPromise;
    expect(replies.content.length).toBe(0);
  });
});
