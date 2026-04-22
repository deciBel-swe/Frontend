import { MockMessageService } from '@/services/mocks/messageService';
import type { SendMessageRequest, UserSummaryDTO } from '@/types/message';

describe('MockMessageService', () => {
  let service: MockMessageService;

  beforeEach(() => {
    service = new MockMessageService();
  });

  it('should subscribe to inbox and receive data', (done) => {
    service.subscribeToInbox(1, (conversations) => {
      expect(conversations).toBeInstanceOf(Array);
      expect(conversations.length).toBeGreaterThan(0);
      expect((conversations[0] as any).id).toBe('conv_1');
      done();
    }, (error) => {
      done(error);
    });
  });

  it('should subscribe to chat and receive data', (done) => {
    service.subscribeToChat('conv_1', (messages) => {
      expect(messages).toBeInstanceOf(Array);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].messageId).toBe('msg_1_1');
      done();
    }, (error) => {
      done(error);
    });
  });

  it('should send a message and update state', async () => {
    const payload: SendMessageRequest = { body: 'New test message' };
    const user: UserSummaryDTO = { id: 1, username: 'testuser', displayName: 'Test User' };
    
    await service.sendMessage('conv_1', payload, user);

    // Verify it was added to chat
    service.subscribeToChat('conv_1', (messages) => {
      const lastMessage = messages[messages.length - 1];
      expect(lastMessage.content).toBe('New test message');
      expect(lastMessage.sender.id).toBe(1);
    }, () => {});

    // Verify it was updated in inbox
    service.subscribeToInbox(1, (conversations) => {
      const conv = (conversations as any[]).find(c => c.id === 'conv_1');
      expect(conv?.lastMessage?.content).toBe('New test message');
    }, () => {});
  });
});
