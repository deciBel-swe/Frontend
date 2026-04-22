import type { MessageDTO, UserSummaryDTO } from '@/types/message';
import type { NotificationDTO } from '@/types/notification';

export const MOCK_USERS: Record<string, UserSummaryDTO> = {
  '1': { id: 1, username: 'alex.johnson', displayName: 'Alex Johnson', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=alex' },
  '2': { id: 2, username: 'jordan.smith', displayName: 'Jordan Smith', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=sara' },
  '3': { id: 3, username: 'musicapp', displayName: 'Music App', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=leo' },
  '4': { id: 4, username: 'sam.taylor', displayName: 'Sam Taylor', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=nina' },
};

export const MOCK_MESSAGES: Record<string, MessageDTO[]> = {
  'conv_1': [
    {
      messageId: 'msg_1_1',
      conversationId: 'conv_1',
      content: 'hi',
      sender: MOCK_USERS['2'],
      resources: [],
      isRead: true,
      createdAt: '2026-04-20T10:00:00Z',
    },
    {
      messageId: 'msg_1_2',
      conversationId: 'conv_1',
      content: 'hey! love your latest mix 🔥',
      sender: MOCK_USERS['1'],
      resources: [],
      isRead: false,
      createdAt: '2026-04-20T10:01:00Z',
    },
  ],
  'conv_2': [
    {
      messageId: 'msg_2_1',
      conversationId: 'conv_2',
      content: 'what are you listening to lately?',
      sender: MOCK_USERS['2'],
      resources: [],
      isRead: true,
      createdAt: '2026-04-20T11:00:00Z',
    },
  ],
};

export const MOCK_NOTIFICATIONS: Record<string, NotificationDTO[]> = {
  '1': [
    {
      id: 'notif_1',
      type: 'FOLLOW',
      user: MOCK_USERS['2'],
      resource: { resourceType: 'USER', resourceId: 1 },
      isRead: false,
      createdAt: '2026-04-21T09:00:00Z',
    },
    {
      id: 'notif_2',
      type: 'LIKE',
      user: MOCK_USERS['3'],
      resource: { resourceType: 'TRACK', resourceId: 1001 },
      isRead: true,
      createdAt: '2026-04-21T08:30:00Z',
    },
  ],
};
