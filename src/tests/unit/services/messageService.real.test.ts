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
      { body: 'Hello' },
      { id: 1, username: 'testuser' }
    );

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.MESSAGES_SEND('2'),
      expect.objectContaining({
        payload: {
          content: 'Hello',
          recipientId: 2,
        },
      })
    );
  });

  it('calls API_CONTRACTS.MESSAGES_START_CONVERSATION when creating conversation', async () => {
    mockedApiRequest.mockResolvedValue({ id: 99 });

    await service.getOrCreateConversation(
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
  });
});
