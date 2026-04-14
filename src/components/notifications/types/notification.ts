import { User } from "./user";

export type NotificationType =
  | "like"
  | "repost"
  | "follow";

export interface Notification {
  id: string;
  type: NotificationType;
  actor: User;
  targetTitle?: string; // playlist name
  targetUrl?: string;
  createdAt: string;
}