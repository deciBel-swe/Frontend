import { apiRequest, normalizeApiError } from '@/hooks/useAPI';
import { RealNotificationService } from '@/services/api/notificationService';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { MessageResponse } from '@/types/user';
import type {
  NotificationsPage,
  UnreadCountResponse,
  NotificationSettingsDTO,
} from '@/types/notification';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
  normalizeApiError: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockedNormalizeApiError = normalizeApiError as jest.MockedFunction<
  typeof normalizeApiError
>;

describe('RealNotificationService', () => {
  let service: RealNotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealNotificationService();
  });

  it('getNotifications calls NOTIFICATIONS_GET with pagination params', async () => {
    const response: NotificationsPage = {
      content: [],
      pageNumber: 1,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
      isLast: true,
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getNotifications({ page: 1, size: 10 });

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.NOTIFICATIONS_GET,
      {
        params: { page: 1, size: 10 },
      }
    );
  });

  it('getNotifications calls NOTIFICATIONS_GET without params if none provided', async () => {
    mockedApiRequest.mockResolvedValue({} as NotificationsPage);
    await service.getNotifications();

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.NOTIFICATIONS_GET,
      {
        params: undefined,
      }
    );
  });

  it('markAllAsRead calls NOTIFICATIONS_MARK_ALL_READ', async () => {
    const response: MessageResponse = {
      message: 'All notifications marked as read',
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.markAllAsRead();

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.NOTIFICATIONS_MARK_ALL_READ
    );
  });

  it('getUnreadCount calls NOTIFICATIONS_UNREAD_COUNT', async () => {
    const response: UnreadCountResponse = { unreadCount: 5 };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getUnreadCount();

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.NOTIFICATIONS_UNREAD_COUNT
    );
  });

  it('getNotificationSettings calls NOTIFICATIONS_GET_SETTINGS', async () => {
    const response: NotificationSettingsDTO = {
      notifyOnFollow: true,
      notifyOnLike: false,
      notifyOnRepost: true,
      notifyOnComment: true,
      notifyOnDM: false,
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getNotificationSettings();

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.NOTIFICATIONS_GET_SETTINGS
    );
  });

  it('updateNotificationSettings calls NOTIFICATIONS_UPDATE_SETTINGS with payload', async () => {
    const payload: NotificationSettingsDTO = {
      notifyOnFollow: false,
      notifyOnLike: false,
      notifyOnRepost: false,
      notifyOnComment: false,
      notifyOnDM: false,
    };
    mockedApiRequest.mockResolvedValue(payload);

    const result = await service.updateNotificationSettings(payload);

    expect(result).toEqual(payload);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.NOTIFICATIONS_UPDATE_SETTINGS,
      {
        payload,
      }
    );
  });

  it('normalizes and rethrows errors', async () => {
    const requestError = new Error('network error');
    const normalizedError = {
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'Server Error',
    };
    mockedApiRequest.mockRejectedValue(requestError);
    mockedNormalizeApiError.mockReturnValue(normalizedError);

    await expect(service.getUnreadCount()).rejects.toEqual(normalizedError);
    expect(mockedNormalizeApiError).toHaveBeenCalledWith(requestError);
  });
});
