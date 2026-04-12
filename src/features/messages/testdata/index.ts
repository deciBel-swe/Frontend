import type { Conversation, User, TrackData, PlaylistData } from '@/components/messages/types';

// ─── Users ────────────────────────────────────────────────────────────────────

export const CURRENT_USER: User = {
  id: '1',
  username: 'alex.johnson',
  displayName: 'Alex Johnson',
};

export const TEST_USERS: User[] = [
  { id: '2', username: 'jordan.smith',  displayName: 'Jordan Smith' },
  { id: '3', username: 'musicapp',      displayName: 'Music App'    },
  { id: '4', username: 'sam.taylor',    displayName: 'Sam Taylor'   },
];

// ─── Reusable track / playlist fixtures ──────────────────────────────────────

const TRACK_SUMMER_VIBES: TrackData = {
  id: 101,
  trackId: 'artistone-summervibes',
  title: 'Summer Vibes',
  artist: 'Artist One',
  cover: '/images/default_song_image.png',
  duration: '3:12',
  genre: 'Rap',
  plays: 63_400_000,
  comments: 6_486,
  likeCount: 0,
  repostCount: 0,
  isLiked: false,
  isReposted: false,
  createdAt: '9 years ago',
};

const TRACK_RHYTHMIC_GROOVE: TrackData = {
  id: 102,
  trackId: 'sam-track',
  title: 'Rhythmic Groove',
  artist: 'Sam Taylor',
  cover: '/images/default_song_image.png',
  duration: '4:20',
  genre: 'Pop',
  plays: 3_350_000,
  comments: 241,
  likeCount: 12_000,
  repostCount: 500,
  isLiked: false,
  isReposted: false,
  createdAt: '2 years ago',
};

const PLAYLIST_MIX: PlaylistData = {
  id: 201,
  playlistId: 'mix',
  title: 'mix',
  owner: 'Zeina.sherif27',
  trackCount: 4,
  tracks: [
    { id: 1, trackId: 'artisttwo-ocean',    title: 'Ocean Waves',    artist: 'Artist Two',   cover: '/images/default_song_image.png', duration: '0:00', plays: 73_500_000,  likeCount: 0, repostCount: 0, isLiked: false, isReposted: false },
    { id: 2, trackId: 'artistthree-beats',  title: 'Rhythmic Beats', artist: 'Artist Three', cover: '/images/default_song_image.png', duration: '0:00', plays: 3_350_000,   likeCount: 0, repostCount: 0, isLiked: false, isReposted: false },
    { id: 3, trackId: 'artistfour-tune',    title: 'Melodic Tune',   artist: 'Artist Four',  cover: '/images/default_song_image.png', duration: '0:00', plays: 2_290_000,   likeCount: 0, repostCount: 0, isLiked: false, isReposted: false },
    { id: 4, trackId: 'artistfive-soul',    title: 'Soulful Song',   artist: 'Artist Five',  cover: '/images/default_song_image.png', duration: '0:00', plays: 345_000,     likeCount: 0, repostCount: 0, isLiked: false, isReposted: false },
  ],
};

// ─── Conversations ────────────────────────────────────────────────────────────

export const TEST_CONVERSATIONS: Conversation[] = [
  // ── Conv 1: Pure text ────────────────────────────────────────────────────
  {
    id: 'conv-1',
    participants: [CURRENT_USER, TEST_USERS[0]],
    unreadCount: 1,
    isMarkedUnread: false,
    messages: [
      {
        id: 'msg-1-1',
        senderId: TEST_USERS[0].id,
        sender: TEST_USERS[0],
        createdAt: '2 minutes ago',
        isRead: true,
        content: [{ type: 'text', text: 'hi' }],
      },
      {
        id: 'msg-1-2',
        senderId: CURRENT_USER.id,
        sender: CURRENT_USER,
        createdAt: '1 minute ago',
        isRead: false,
        content: [{ type: 'text', text: 'hey! love your latest mix 🔥' }],
      },
    ],
    get lastMessage() { return this.messages[this.messages.length - 1]; },
  },

  // ── Conv 2: Text + Track ─────────────────────────────────────────────────
  {
    id: 'conv-2',
    participants: [CURRENT_USER, TEST_USERS[0]],
    unreadCount: 0,
    isMarkedUnread: false,
    messages: [
      {
        id: 'msg-2-1',
        senderId: TEST_USERS[0].id,
        sender: TEST_USERS[0],
        createdAt: '5 minutes ago',
        isRead: true,
        content: [{ type: 'text', text: 'what are you listening to lately?' }],
      },
      {
        id: 'msg-2-2',
        senderId: CURRENT_USER.id,
        sender: CURRENT_USER,
        createdAt: '3 minutes ago',
        isRead: true,
        content: [{ type: 'text', text: 'been on a chill vibes kick honestly' }],
      },
      {
        id: 'msg-2-3',
        senderId: CURRENT_USER.id,
        sender: CURRENT_USER,
        createdAt: '2 minutes ago',
        isRead: true,
        content: [
          { type: 'text', text: 'check this out!' },
          { type: 'track', track: TRACK_SUMMER_VIBES },
        ],
      },
    ],
    get lastMessage() { return this.messages[this.messages.length - 1]; },
  },

  // ── Conv 3: Text + Playlist ──────────────────────────────────────────────
  {
    id: 'conv-3',
    participants: [CURRENT_USER, TEST_USERS[1]],
    unreadCount: 1,
    isMarkedUnread: true,
    messages: [
      {
        id: 'msg-3-1',
        senderId: TEST_USERS[1].id,
        sender: TEST_USERS[1],
        createdAt: '16 days ago',
        isRead: false,
        content: [
          { type: 'text', text: 'Here is a playlist you might enjoy' },
          { type: 'playlist', playlist: PLAYLIST_MIX },
        ],
      },
    ],
    get lastMessage() { return this.messages[this.messages.length - 1]; },
  },

  // ── Conv 4: Text + Track + Playlist ─────────────────────────────────────
  {
    id: 'conv-4',
    participants: [CURRENT_USER, TEST_USERS[2]],
    unreadCount: 2,
    isMarkedUnread: false,
    messages: [
      {
        id: 'msg-4-1',
        senderId: TEST_USERS[2].id,
        sender: TEST_USERS[2],
        createdAt: '3 hours ago',
        isRead: false,
        content: [
          { type: 'text', text: 'yo check this track AND this playlist, both fire!' },
          { type: 'track',    track:    TRACK_RHYTHMIC_GROOVE },
          { type: 'playlist', playlist: PLAYLIST_MIX          },
        ],
      },
    ],
    get lastMessage() { return this.messages[this.messages.length - 1]; },
  },
];

// ─── Derive InboxItems from conversations ─────────────────────────────────────

export function getInboxItems(conversations: Conversation[], currentUserId: string) {
  return conversations.map((conv) => {
    const participant = conv.participants.find((p) => p.id !== currentUserId)!;
    const lastContent = conv.lastMessage.content[0];
    let preview = '';
    if (lastContent.type === 'text') {
      preview = lastContent.text ?? '';
    } else if (lastContent.type === 'track') {
      preview = `🎵 ${lastContent.track?.title}`;
    } else if (lastContent.type === 'playlist') {
      preview = `▶ ${lastContent.playlist?.title}`;
    }
    return {
      conversationId: conv.id,
      participant,
      lastMessagePreview: preview,
      lastMessageAt: conv.lastMessage.createdAt,
      unreadCount: conv.unreadCount,
    };
  });
}