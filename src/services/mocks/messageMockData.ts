import type {
  MessageDTO,
  PaginatedMessageResponse,
  ResourceRefFullDTO,
  SendMessageRequest,
} from '@/types/message';

const cloneResources = (
  resources: ResourceRefFullDTO[]
): ResourceRefFullDTO[] => resources.map((resource) => ({ ...resource }));

const cloneMessage = (message: MessageDTO): MessageDTO => ({
  ...message,
  sender: { ...message.sender },
  resources: cloneResources(message.resources),
});

const sara: MessageDTO['sender'] = {
  id: 42,
  username: 'sara',
  displayName: 'Sara',
  avatarUrl: 'https://example.com/avatars/sara.png',
  isFollowing: false,
  followerCount: 100,
  trackCount: 24,
};

const ahmed: MessageDTO['sender'] = {
  id: 77,
  username: 'ahmed',
  displayName: 'Ahmed',
  avatarUrl: 'https://example.com/avatars/ahmed.png',
  isFollowing: true,
  followerCount: 12,
  trackCount: 8,
};

const lina: MessageDTO['sender'] = {
  id: 88,
  username: 'lina',
  displayName: 'Lina',
  avatarUrl: null,
  isFollowing: null,
  followerCount: 3,
  trackCount: 1,
};

const trackResource: ResourceRefFullDTO = {
  resourceType: 'TRACK',
  resourceId: 99,
  playlist: null,
  track: null,
  user: null,
};

const playlistResource: ResourceRefFullDTO = {
  resourceType: 'PLAYLIST',
  resourceId: 17,
  playlist: null,
  track: null,
  user: null,
};

const inboxMessages: MessageDTO[] = [
  {
    messageId: 201,
    conversationId: 5,
    sender: sara,
    content: 'check this out',
    resources: [trackResource],
    isRead: false,
    createdAt: '2025-04-08T11:55:00Z',
  },
  {
    messageId: 202,
    conversationId: 8,
    sender: ahmed,
    content: 'Sounds great',
    resources: [],
    isRead: true,
    createdAt: '2025-04-08T09:15:00Z',
  },
];

const historyByUserId: Record<number, MessageDTO[]> = {
  42: [
    {
      messageId: 101,
      conversationId: 5,
      sender: ahmed,
      content: 'Are you free tonight?',
      resources: [],
      isRead: true,
      createdAt: '2025-04-08T11:00:00Z',
    },
    {
      messageId: 102,
      conversationId: 5,
      sender: sara,
      content: 'I am sending you the track now',
      resources: [trackResource],
      isRead: false,
      createdAt: '2025-04-08T11:55:00Z',
    },
    {
      messageId: 103,
      conversationId: 5,
      sender: ahmed,
      content: 'This playlist is also nice',
      resources: [playlistResource],
      isRead: false,
      createdAt: '2025-04-08T12:05:00Z',
    },
  ],
  77: [
    {
      messageId: 301,
      conversationId: 8,
      sender: ahmed,
      content: 'Sounds great',
      resources: [],
      isRead: true,
      createdAt: '2025-04-08T09:15:00Z',
    },
    {
      messageId: 302,
      conversationId: 8,
      sender: lina,
      content: 'Let me know when it is uploaded',
      resources: [],
      isRead: false,
      createdAt: '2025-04-08T09:45:00Z',
    },
  ],
};

export const getMockInboxResponse = (
  page = 0,
  size = 20
): PaginatedMessageResponse => ({
  content: inboxMessages
    .slice(page * size, page * size + size)
    .map(cloneMessage),
  pageNumber: page,
  pageSize: size,
  totalElements: inboxMessages.length,
  totalPages: Math.max(1, Math.ceil(inboxMessages.length / size)),
  isLast: (page + 1) * size >= inboxMessages.length,
});

export const getMockChatHistoryResponse = (
  userId: number,
  page = 0,
  size = 30
): PaginatedMessageResponse => {
  const messages = historyByUserId[userId] ?? [];

  return {
    content: messages.slice(page * size, page * size + size).map(cloneMessage),
    pageNumber: page,
    pageSize: size,
    totalElements: messages.length,
    totalPages: Math.max(1, Math.ceil(messages.length / size)),
    isLast: (page + 1) * size >= messages.length,
  };
};

export const buildMockSentMessage = (
  userId: number,
  payload: SendMessageRequest
): MessageDTO => ({
  messageId: Date.now(),
  conversationId: userId === 42 ? 5 : 8,
  sender: sara,
  content: payload.body,
  resources: (payload.resources ?? []).map((resource) => ({
    resourceType: resource.resourceType,
    resourceId: resource.resourceId,
    playlist: null,
    track: null,
    user: null,
  })),
  isRead: false,
  createdAt: new Date().toISOString(),
});
