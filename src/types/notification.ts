import { z } from 'zod';

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
});
export type NotificationDTO = z.infer<typeof notificationDTOSchema>;

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

export const deviceTypeSchema = z.enum(['DESKTOP', 'MOBILE', 'TABLET']);

export const registerDeviceTokenRequestSchema = z.object({
  token: z.string().min(1),
  deviceType: deviceTypeSchema,
});
export type RegisterDeviceTokenRequest = z.infer<
  typeof registerDeviceTokenRequestSchema
>;
