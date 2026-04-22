import { MockNotificationService } from '@/services/mocks/notificationService';

describe('MockNotificationService', () => {
  let service: MockNotificationService;

  beforeEach(() => {
    service = new MockNotificationService();
  });

  it('should subscribe to notifications and receive data', (done) => {
    service.subscribeToNotifications(1, (notifications) => {
      expect(notifications).toBeInstanceOf(Array);
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].id).toBe('notif_1');
      done();
    }, (error) => {
      done(error);
    });
  });

  it('should mark all as read and update state', async () => {
    await service.markAllAsRead(1);

    service.subscribeToNotifications(1, (notifications) => {
      expect(notifications.every(n => n.isRead)).toBe(true);
    }, () => {});
  });

  it('should accurately calculate unread count (simulated via hook logic elsewhere, but verifying data here)', (done) => {
    service.subscribeToNotifications(1, (notifications) => {
      const unreadCount = notifications.filter(n => !n.isRead).length;
      expect(unreadCount).toBe(1); // Default from mock data
      done();
    }, (error) => {
      done(error);
    });
  });
});
