import { FirebaseMessageService } from '@/services/api/messageService';
import { onSnapshot, addDoc, collection, query, where, orderBy } from 'firebase/firestore';
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
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
}));

jest.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('FirebaseMessageService (Real)', () => {
  let service: FirebaseMessageService;

  beforeEach(() => {
    service = new FirebaseMessageService();
    jest.clearAllMocks();
  });

  it('should call onSnapshot when subscribing to inbox', () => {
    const onUpdate = jest.fn();
    const onError = jest.fn();
    
    service.subscribeToInbox(1, onUpdate, onError);

    expect(onSnapshot).toHaveBeenCalled();
    expect(query).toHaveBeenCalled();
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'conversations');
    expect(where).toHaveBeenCalledWith('participantIds', 'array-contains', 1);
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
    
    (addDoc as jest.Mock).mockResolvedValueOnce({ id: 'new_msg_id' });

    await service.sendMessage('conv_1', payload, user);

    expect(addDoc).toHaveBeenCalled();
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'conversations', 'conv_1', 'messages');
    
    const sentData = (addDoc as jest.Mock).mock.calls[0][1];
    expect(sentData.content).toBe('Real test message');
    expect(sentData.sender.id).toBe(1);
  });
});
