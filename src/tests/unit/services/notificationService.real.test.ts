import { FirebaseNotificationService } from '@/services/api/notificationService';
import { onSnapshot, collection, query, where, orderBy, getDocs, writeBatch } from 'firebase/firestore';

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

describe('FirebaseNotificationService (Real)', () => {
  let service: FirebaseNotificationService;

  beforeEach(() => {
    service = new FirebaseNotificationService();
    jest.clearAllMocks();
  });

  it('should call onSnapshot when subscribing to notifications', () => {
    const onUpdate = jest.fn();
    const onError = jest.fn();
    
    service.subscribeToNotifications(1, onUpdate, onError);

    expect(onSnapshot).toHaveBeenCalled();
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'notifications');
    expect(where).toHaveBeenCalledWith('recipientId', '==', 1);
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
});
