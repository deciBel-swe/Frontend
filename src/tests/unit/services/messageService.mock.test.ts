import { MockMessageService } from '@/services/mocks/messageService';

describe('MockMessageService', () => {
  let service: MockMessageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MockMessageService();
  });

  it('getInbox returns paginated messages', async () => {
    const response = await service.getInbox({ page: 0, size: 20 });

    expect(response.pageNumber).toBe(0);
    expect(response.pageSize).toBe(20);
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.totalElements).toBeGreaterThan(0);
  });

  it('getChatHistory returns paginated history', async () => {
    const response = await service.getChatHistory(42, { page: 0, size: 20 });

    expect(response.pageNumber).toBe(0);
    expect(response.pageSize).toBe(20);
    expect(Array.isArray(response.content)).toBe(true);
  });

  it('sendMessage returns created message and trims body', async () => {
    const response = await service.sendMessage(99, {
      body: '  hello from mock  ',
      resources: [{ resourceType: 'TRACK', resourceId: 7 }],
    });

    expect(response.messageId).toBeGreaterThan(0);
    expect(response.conversationId).toBeGreaterThan(0);
    expect(response.content).toBe('hello from mock');
    expect(response.resources).toHaveLength(1);
    expect(response.resources[0].resourceType).toBe('TRACK');
    expect(response.resources[0].resourceId).toBe(7);
  });
});
