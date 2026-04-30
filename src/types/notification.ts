import { z } from 'zod';
import { paginatedResponseSchema } from './pagination';

export const userSummarySchema = z.object({
  id: z.number().int().nonnegative(),
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable().optional(),
  isFollowing: z.boolean().optional(),
  followerCount: z.number().int().nonnegative().optional(),
  trackCount: z.number().int().nonnegative().optional(),
});
export type UserSummaryDTO = z.infer<typeof userSummarySchema>;

export const notificationTypeSchema = z.enum([
  'FOLLOW',
  'LIKE',
  'REPOST',
  'COMMENT',
  'REPLY',
  'DM',
]);

export const resourceRefSchema = z.object({
  resourceType: z.enum(['TRACK', 'PLAYLIST', 'USER']),
  resourceId: z.number().int().nonnegative(),
});

export const notificationDTOSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  user: userSummarySchema,
  resource: resourceRefSchema,
  isRead: z.boolean(),
  createdAt: z.string(),
  targetTitle: z.string().optional(),
  targetUrl: z.string().optional(),
  conversationId: z.string().optional(),
});
export type NotificationDTO = z.infer<typeof notificationDTOSchema>;

export const notificationActorSchema = z.object({
  id: z.number().int().nonnegative(),
  username: z.string().trim().min(1),
});
export type NotificationActorDTO = z.infer<typeof notificationActorSchema>;

export const notificationObjectSchema = z.object({
  id: z.number().int().nonnegative(),
  type: z.string().trim().min(1),
  actor: notificationActorSchema,
  entityId: z.number().int().nonnegative(),
  isRead: z.boolean(),
  createdAt: z.string().trim().min(1),
});
export type NotificationObjectDTO = z.infer<typeof notificationObjectSchema>;

export const paginatedNotificationsResponseSchema =
  paginatedResponseSchema(notificationObjectSchema);
export type PaginatedNotificationsResponseDTO = z.infer<
  typeof paginatedNotificationsResponseSchema
>;

export const unreadCountResponseSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
});
export type UnreadCountResponse = z.infer<typeof unreadCountResponseSchema>;

export const notificationSettingsDTOSchema = z.object({
  notifyOnFollow: z.boolean(),
  notifyOnLike: z.boolean(),
  notifyOnRepost: z.boolean(),
  notifyOnComment: z.boolean(),
  notifyOnDM: z.boolean(),
});
export type NotificationSettingsDTO = z.infer<
  typeof notificationSettingsDTOSchema
>;

export const registerDeviceTokenSchema = z.object({
  token: z.string(),
  deviceType: z.enum(['WEB', 'ANDROID', 'IOS']).default('WEB'),
});
export type RegisterDeviceTokenRequest = z.infer<typeof registerDeviceTokenSchema>;
