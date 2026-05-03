import { FirebaseNotificationService } from '@/services/api/notificationService';
import {
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { apiRequest } from '@/hooks/useAPI';

// Mock Firebase SDK
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  getDocs: jest.fn(),
  writeBatch: jest.fn(() => ({
    update: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
  normalizeApiError: jest.fn((e) => e),
}));

jest.mock('@/services/firebase/realtimeSocial', () => ({
  ensureRealtimeSession: jest.fn(() => Promise.resolve()),
  getCurrentRealtimeUserId: jest.fn(() => 1),
  syncRealtimeNotificationSettings: jest.fn(() => Promise.resolve()),
}));

describe('FirebaseNotificationService (Real)', () => {
  let service: FirebaseNotificationService;

  beforeEach(() => {
    service = new FirebaseNotificationService();
    jest.clearAllMocks();
  });

  it('should call onSnapshot when subscribing to notifications', async () => {
    const onUpdate = jest.fn();
    const onError = jest.fn();
    
    service.subscribeToNotifications(1, onUpdate, onError);
    await Promise.resolve();

    expect(onSnapshot).toHaveBeenCalled();
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'notifications');
    expect(where).toHaveBeenCalledWith('recipientId', '==', '1');
  });

  it('should call writeBatch and commit when marking all as read', async () => {
    const mockSnapshot = {
      docs: [
        { ref: 'ref1' },
        { ref: 'ref2' },
      ],
    };
    (getDocs as jest.Mock).mockResolvedValueOnce(mockSnapshot);

    await service.markAllAsRead(1);

    expect(getDocs).toHaveBeenCalled();
    expect(writeBatch).toHaveBeenCalled();
    
    const batch = (writeBatch as jest.Mock).mock.results[0].value;
    expect(batch.update).toHaveBeenCalledTimes(2);
    expect(batch.commit).toHaveBeenCalled();
  });

  it('returns unread count from firestore', async () => {
    (getDocs as jest.Mock).mockResolvedValueOnce({ size: 3 });

    await expect(service.getUnreadCount()).resolves.toEqual({ unreadCount: 3 });
    expect(where).toHaveBeenCalledWith('recipientId', '==', '1');
  });

  it('syncs notification settings after reading them', async () => {
    (apiRequest as jest.Mock).mockResolvedValueOnce({
      notifyOnFollow: true,
      notifyOnLike: true,
      notifyOnRepost: false,
      notifyOnComment: true,
      notifyOnDM: false,
    });

    await expect(service.getNotificationSettings()).resolves.toMatchObject({
      notifyOnRepost: false,
      notifyOnDM: false,
    });
  });
});
