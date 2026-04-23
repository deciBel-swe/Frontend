import type {
  ConversationDTO,
  MessageDTO,
  UserSummaryDTO,
} from '@/types/message';
import type { NotificationDTO } from '@/types/notification';

export const MOCK_USERS: Record<string, UserSummaryDTO> = {
  '1': {
    id: 1,
    username: 'alex.johnson',
    displayName: 'Alex Johnson',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=alex',
  },
  '2': {
    id: 2,
    username: 'jordan.smith',
    displayName: 'Jordan Smith',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=sara',
  },
  '3': {
    id: 3,
    username: 'musicapp',
    displayName: 'Music App',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=leo',
  },
  '4': {
    id: 4,
    username: 'sam.taylor',
    displayName: 'Sam Taylor',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=nina',
  },
};

export const MOCK_CONVERSATIONS: ConversationDTO[] = [
  {
    id: 'conv_1',
    participantIds: ['1', '2'],
    participants: [
      {
        id: '1',
        username: 'alex.johnson',
        displayName: 'Alex Johnson',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=alex',
      },
      {
        id: '2',
        username: 'jordan.smith',
        displayName: 'Jordan Smith',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=sara',
      },
    ],
    updatedAt: '2026-04-20T10:01:00Z',
    createdAt: '2026-04-20T09:59:00Z',
    lastMessage: {
      content: 'hey! love your latest mix',
      senderId: '1',
      createdAt: '2026-04-20T10:01:00Z',
    },
    unreadCounts: {
      '1': 0,
      '2': 1,
    },
    manuallyUnreadBy: {
      '1': false,
      '2': false,
    },
  },
  {
    id: 'conv_2',
    participantIds: ['1', '3'],
    participants: [
      {
        id: '1',
        username: 'alex.johnson',
        displayName: 'Alex Johnson',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=alex',
      },
      {
        id: '3',
        username: 'musicapp',
        displayName: 'Music App',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=leo',
      },
    ],
    updatedAt: '2026-04-20T11:00:00Z',
    createdAt: '2026-04-20T10:55:00Z',
    lastMessage: {
      content: 'what are you listening to lately?',
      senderId: '3',
      createdAt: '2026-04-20T11:00:00Z',
    },
    unreadCounts: {
      '1': 1,
      '3': 0,
    },
    manuallyUnreadBy: {
      '1': false,
      '3': false,
    },
  },
];

export const MOCK_MESSAGES: Record<string, MessageDTO[]> = {
  conv_1: [
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
      content: 'hey! love your latest mix',
      sender: MOCK_USERS['1'],
      resources: [],
      isRead: false,
      createdAt: '2026-04-20T10:01:00Z',
    },
  ],
  conv_2: [
    {
      messageId: 'msg_2_1',
      conversationId: 'conv_2',
      content: 'what are you listening to lately?',
      sender: MOCK_USERS['3'],
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
      user: MOCK_USERS['2'] as unknown as NotificationDTO['user'],
      resource: { resourceType: 'USER', resourceId: 1 },
      isRead: false,
      createdAt: '2026-04-21T09:00:00Z',
    },
    {
      id: 'notif_2',
      type: 'LIKE',
      user: MOCK_USERS['3'] as unknown as NotificationDTO['user'],
      resource: { resourceType: 'TRACK', resourceId: 1001 },
      isRead: true,
      createdAt: '2026-04-21T08:30:00Z',
      targetTitle: 'Ocean Echoes',
    },
    {
      id: 'notif_3',
      type: 'COMMENT',
      user: MOCK_USERS['4'] as unknown as NotificationDTO['user'],
      resource: { resourceType: 'TRACK', resourceId: 1001 },
      isRead: false,
      createdAt: '2026-04-21T08:15:00Z',
      targetTitle: 'Ocean Echoes',
    },
    {
      id: 'notif_4',
      type: 'DM',
      user: MOCK_USERS['2'] as unknown as NotificationDTO['user'],
      resource: { resourceType: 'USER', resourceId: 2 },
      isRead: false,
      createdAt: '2026-04-21T08:00:00Z',
      conversationId: 'conv_1',
    },
  ],
};
