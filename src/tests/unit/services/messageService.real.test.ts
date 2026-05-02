import { FirebaseMessageService } from '@/services/api/messageService';
import {
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  collection,
  query,
  where,
  orderBy,
  getDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import type { SendMessageRequest, UserSummaryDTO } from '@/types/message';

// Mock Firebase SDK
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  writeBatch: jest.fn(() => ({
    update: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  })),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
}));

jest.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('FirebaseMessageService (Real)', () => {
  let service: FirebaseMessageService;

  beforeEach(() => {
    service = new FirebaseMessageService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call onSnapshot when subscribing to inbox', () => {
    const onUpdate = jest.fn();
    const onError = jest.fn();

    service.subscribeToInbox(1, onUpdate, onError);

    expect(onSnapshot).toHaveBeenCalled();
    expect(query).toHaveBeenCalled();
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'conversations');
    expect(where).toHaveBeenCalledWith('participantIds', 'array-contains', '1');
  });

  it('should call onSnapshot when subscribing to chat', () => {
    const onUpdate = jest.fn();
    const onError = jest.fn();
    
    service.subscribeToChat('conv_1', onUpdate, onError);

    expect(onSnapshot).toHaveBeenCalled();
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'conversations', 'conv_1', 'messages');
  });

  it('should call addDoc when sending a message', async () => {
    const payload: SendMessageRequest = { body: 'Real test message' };
    const user: UserSummaryDTO = { id: 1, username: 'testuser', displayName: 'Test User' };
    
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        participantIds: ['1', '2'],
        unreadCounts: { '1': 0, '2': 0 },
        manuallyUnreadBy: { '1': false, '2': false },
      }),
    });
    (addDoc as jest.Mock).mockResolvedValueOnce({ id: 'new_msg_id' });

    await service.sendMessage('conv_1', payload, user);

    expect(addDoc).toHaveBeenCalled();
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'conversations', 'conv_1', 'messages');
    
    const sentData = (addDoc as jest.Mock).mock.calls[0][1];
    expect(sentData.content).toBe('Real test message');
    expect(sentData.sender.id).toBe(1);
  });

  it('marks a conversation as read', async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        participantIds: ['1', '2'],
        unreadCounts: { '1': 2, '2': 0 },
        manuallyUnreadBy: { '1': true, '2': false },
      }),
    });
    (getDocs as jest.Mock).mockResolvedValueOnce({
      docs: [{ ref: 'msg_ref', data: () => ({ sender: { id: 2 }, isRead: false }) }],
    });

    await service.markConversationRead('conv_1', 1);

    expect(setDoc).toHaveBeenCalled();
    const batch = (writeBatch as jest.Mock).mock.results[0].value;
    expect(batch.update).toHaveBeenCalled();
    expect(batch.commit).toHaveBeenCalled();
  });
});
