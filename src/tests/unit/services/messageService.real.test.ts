import { apiRequest, normalizeApiError } from '@/hooks/useAPI';
import { RealMessageService } from '@/services/api/messageService';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { MessageDTO, PaginatedMessageResponse } from '@/types/message';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
  normalizeApiError: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockedNormalizeApiError = normalizeApiError as jest.MockedFunction<
  typeof normalizeApiError
>;

describe('RealMessageService', () => {
  let service: RealMessageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealMessageService();
  });

  it('calls MESSAGES_INBOX with pagination params', async () => {
    const response: PaginatedMessageResponse = {
      content: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getInbox({ page: 0, size: 20 });

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.MESSAGES_INBOX,
      {
        params: { page: 0, size: 20 },
      }
    );
  });

  it('calls MESSAGES_CHAT_HISTORY with userId and pagination params', async () => {
    const response: PaginatedMessageResponse = {
      content: [],
      pageNumber: 1,
      pageSize: 10,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getChatHistory(42, { page: 1, size: 10 });

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.MESSAGES_CHAT_HISTORY(42),
      {
        params: { page: 1, size: 10 },
      }
    );
  });

  it('calls MESSAGES_SEND with payload', async () => {
    const response: MessageDTO = {
      messageId: 201,
      conversationId: 5,
      sender: {
        id: 42,
        username: 'sara',
        displayName: 'Sara',
        avatarUrl: 'https://example.com/avatars/sara.png',
        isFollowing: false,
        followerCount: 100,
        trackCount: 24,
      },
      content: 'check this out',
      resources: [],
      isRead: false,
      createdAt: '2025-04-08T11:55:00Z',
    };
    mockedApiRequest.mockResolvedValue(response);

    const payload = {
      body: 'check this out',
      resources: [{ resourceType: 'TRACK' as const, resourceId: 99 }],
    };

    const result = await service.sendMessage(42, payload);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.MESSAGES_SEND(42),
      {
        payload,
      }
    );
  });

  it('normalizes and rethrows errors from getInbox', async () => {
    const requestError = new Error('network fail');
    const normalizedError = {
      statusCode: 401,
      message: 'Access token has expired',
      error: 'Unauthorized',
    };
    mockedApiRequest.mockRejectedValue(requestError);
    mockedNormalizeApiError.mockReturnValue(normalizedError);

    await expect(service.getInbox()).rejects.toEqual(normalizedError);
    expect(mockedNormalizeApiError).toHaveBeenCalledWith(requestError);
  });
});
