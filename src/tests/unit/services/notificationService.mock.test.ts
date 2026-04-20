import { MockNotificationService } from '@/services/mocks/notificationService';

describe('MockNotificationService', () => {
  let service: MockNotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MockNotificationService();
  });

  it('getNotifications returns paginated notification mock data', async () => {
    const response = await service.getNotifications();

    expect(response.content).toHaveLength(1);
    expect(response.totalElements).toBe(1);
    expect(response.content[0].type).toBe('LIKE');
    expect(response.content[0].user.username).toBe('sara');
  });

  it('markAllAsRead returns success message', async () => {
    const response = await service.markAllAsRead();

    expect(response).toEqual({ message: 'All notifications marked as read' });
  });

  it('getUnreadCount returns hardcoded unread count', async () => {
    const response = await service.getUnreadCount();

    expect(response).toEqual({ unreadCount: 7 });
  });

  it('getNotificationSettings returns mock settings configuration', async () => {
    const response = await service.getNotificationSettings();

    expect(response).toEqual({
      notifyOnFollow: true,
      notifyOnLike: true,
      notifyOnRepost: true,
      notifyOnComment: true,
      notifyOnDM: true,
    });
  });

  it('updateNotificationSettings echoes back the provided payload', async () => {
    const payload = {
      notifyOnFollow: false,
      notifyOnLike: false,
      notifyOnRepost: true,
      notifyOnComment: true,
      notifyOnDM: false,
    };

    const response = await service.updateNotificationSettings(payload);

    expect(response).toEqual(payload);
  });
});
