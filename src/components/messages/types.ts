import type { TrackCardTrack, TrackCardUser } from '@/components/tracks/track-card/types';

export type { TrackCardTrack, TrackCardUser };

// ─── Core User ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

// ─── Track ────────────────────────────────────────────────────────────────────

// TrackData extends TrackCardTrack (the single source of truth) with the
export type TrackData = TrackCardTrack;

// ─── Playlist ─────────────────────────────────────────────────────────────────

export interface PlaylistData {
  id: number;
  playlistId: string;
  title: string;
  owner: string;
  cover?: string;
  trackCount?: number;
  tracks?: TrackData[];
}

// ─── Message Content ──────────────────────────────────────────────────────────

export type MessageContentType = 'text' | 'track' | 'playlist';

export interface MessageContent {
  type: MessageContentType;
  text?: string;
  track?: TrackData;
  playlist?: PlaylistData;
}

// ─── Message ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  senderId: string;
  sender: User;
  content: MessageContent[];
  createdAt: string;
  isRead: boolean;
}

// ─── Conversation / Inbox ─────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
  isMarkedUnread?: boolean;
}

export interface InboxItem {
  conversationId: string;
  participant: User;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}

// ─── List Component ───────────────────────────────────────────────────────────

export type ListType = 'track' | 'playlist';

export interface ListProps {
  type: ListType;
  trackId?: string;
  playlistId?: string;
  user?: User;
  track?: TrackData;
  playlist?: PlaylistData;
}

// ─── New Message Form ─────────────────────────────────────────────────────────

export interface NewMessageFormData {
  to: string;
  message: string;
  attachedTrackId?: string;
  attachedPlaylistId?: string;
}