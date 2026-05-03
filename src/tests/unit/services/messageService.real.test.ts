import { apiRequest } from '@/hooks/useAPI';
import { FirebaseMessageService } from '@/services/api/messageService';
import { API_CONTRACTS } from '@/types/apiContracts';
import { onMessage } from 'firebase/messaging';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('firebase/messaging', () => ({
  onMessage: jest.fn(),
  getToken: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  messaging: {},
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockedOnMessage = onMessage as jest.MockedFunction<typeof onMessage>;

describe('FirebaseMessageService (REST + FCM)', () => {
  let service: FirebaseMessageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FirebaseMessageService();
  });

  it('calls API_CONTRACTS.MESSAGES_LIST_CONVERSATIONS when subscribing to inbox', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      totalPages: 0,
      totalElements: 0,
    });
    const onUpdate = jest.fn();
    const onError = jest.fn();

    service.subscribeToInbox(1, onUpdate, onError);

    // Wait for the async fetch to resolve
    await new Promise(process.nextTick);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.MESSAGES_LIST_CONVERSATIONS
    );
    expect(mockedOnMessage).toHaveBeenCalled();
  });

  it('calls API_CONTRACTS.MESSAGES_LIST_MESSAGES when subscribing to chat', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      totalPages: 0,
      totalElements: 0,
    });
    const onUpdate = jest.fn();
    const onError = jest.fn();

    service.subscribeToChat('conv_1', onUpdate, onError);

    await new Promise(process.nextTick);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.MESSAGES_LIST_MESSAGES('conv_1')
    );
    expect(mockedOnMessage).toHaveBeenCalled();
  });

  it('calls API_CONTRACTS.MESSAGES_SEND when sending a message', async () => {
    mockedApiRequest.mockResolvedValue({ id: 1 });

    await service.sendMessage(
      '2',
      { content: 'Hello', recipientId: 40 },
      { id: 1, username: 'testuser' }
    );

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.MESSAGES_SEND('2'),
      expect.objectContaining({
        payload: {
          content: 'Hello',
          recipientId: 40,
        },
      })
    );
  });

  it('creates a conversation and returns the conversation id', async () => {
    mockedApiRequest.mockResolvedValue({ conversationId: 99 });

    const conversationId = await service.getOrCreateConversation(
      {
        id: 1,
        username: 'me',
        email: 'me@me.com',
        role: 'USER',
        tier: 'FREE',
      } as unknown as any,
      { id: 99, username: 'other' }
    );

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.MESSAGES_START_CONVERSATION(99)
    );
    expect(conversationId).toBe('99');
  });

  it('creates a conversation when other user is a UserPublic object', async () => {
    mockedApiRequest.mockResolvedValue({ conversationId: 100 });

    const conversationId = await service.getOrCreateConversation(
      {
        id: 1,
        username: 'me',
        email: 'me@me.com',
        role: 'USER',
        tier: 'FREE',
      } as unknown as any,
      {
        profile: {
          id: 42,
          email: 'other@example.com',
          username: 'other',
          displayName: 'Other',
          tier: 'FREE',
          followerCount: 0,
          followingCount: 0,
          trackCount: 0,
          isFollowed: false,
          isFollowing: false,
          isBlocked: false,
          bio: '',
          city: '',
          country: '',
          profilePic: '',
          coverPic: '',
          favoriteGenres: [],
          socialLinksDto: [],
        },
        privacySettings: null,
      } as unknown as any
    );

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.MESSAGES_START_CONVERSATION(42)
    );
    expect(conversationId).toBe('100');
  });

  it('accepts backend response with id instead of conversationId', async () => {
    mockedApiRequest.mockResolvedValue({ id: 101 });

    const conversationId = await service.getOrCreateConversation(
      {
        id: 1,
        username: 'me',
        email: 'me@me.com',
        role: 'USER',
        tier: 'FREE',
      } as unknown as any,
      { id: 99, username: 'other' }
    );

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.MESSAGES_START_CONVERSATION(99)
    );
    expect(conversationId).toBe('101');
  });
});
