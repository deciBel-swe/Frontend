import { User } from "./user";

export type NotificationType =
  | "like"
  | "repost"
  | "follow"
  | "comment"
  | "reply"
  | "dm";

export interface Notification {
  id: string;
  type: NotificationType;
  actor: User;
  resourceType: 'TRACK' | 'PLAYLIST' | 'USER';
  resourceId: number;
  isRead: boolean;
  targetTitle?: string; // playlist name
  targetUrl?: string;
  createdAt: string;
  conversationId?: string;
}
