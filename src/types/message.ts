import { z } from 'zod';
import { paginatedResponseSchema } from './pagination';

export const messageResourceTypeSchema = z.enum(['TRACK', 'PLAYLIST']);
export type MessageResourceType = z.infer<typeof messageResourceTypeSchema>;

export const userSummaryDTOSchema = z.object({
  id: z.number().int().nonnegative(),
  username: z.string().trim().min(1),
  displayName: z.string().trim().nullable().optional(),
  avatarUrl: z.string().trim().nullable().optional(),
  isFollowing: z.boolean().nullable().optional(),
  followerCount: z.number().int().nonnegative().nullable().optional(),
  trackCount: z.number().int().nonnegative().nullable().optional(),
});
export type UserSummaryDTO = z.infer<typeof userSummaryDTOSchema>;

export const resourceRefDTOSchema = z.object({
  resourceType: messageResourceTypeSchema,
  resourceId: z.number().int().positive(),
});
export type ResourceRefDTO = z.infer<typeof resourceRefDTOSchema>;

export const resourceRefFullDTOSchema = z.object({
  resourceType: messageResourceTypeSchema,
  resourceId: z.number().int().positive(),
  playlist: z.unknown().nullable().optional(),
  track: z.unknown().nullable().optional(),
  user: z.unknown().nullable().optional(),
});
export type ResourceRefFullDTO = z.infer<typeof resourceRefFullDTOSchema>;

export const conversationParticipantSchema = z.object({
  id: z.string().trim().min(1),
  username: z.string().trim().min(1),
  displayName: z.string().trim().nullable().optional(),
  avatarUrl: z.string().trim().nullable().optional(),
});
export type ConversationParticipantDTO = z.infer<
  typeof conversationParticipantSchema
>;

export const conversationLastMessageSchema = z.object({
  content: z.string().trim().min(1),
  senderId: z.string().trim().min(1),
  createdAt: z.string().trim().min(1),
});
export type ConversationLastMessageDTO = z.infer<
  typeof conversationLastMessageSchema
>;

export const messageDTOSchema = z.object({
  messageId: z.string(),
  conversationId: z.string(),
  sender: userSummaryDTOSchema,
  content: z.string().trim().min(1),
  resources: z.array(resourceRefFullDTOSchema).default([]),
  isRead: z.boolean(),
  createdAt: z.string().trim().min(1),
});
export type MessageDTO = z.infer<typeof messageDTOSchema>;

export const conversationDTOSchema = z.object({
  id: z.string().trim().min(1),
  participantIds: z.array(z.string().trim().min(1)).default([]),
  participants: z.array(conversationParticipantSchema).default([]),
  lastMessage: conversationLastMessageSchema.nullable().optional(),
  unreadCounts: z
    .record(z.string(), z.number().int().nonnegative())
    .default({}),
  manuallyUnreadBy: z.record(z.string(), z.boolean()).default({}),
  createdAt: z.string().trim().min(1).optional(),
  updatedAt: z.string().trim().min(1).optional(),
});
export type ConversationDTO = z.infer<typeof conversationDTOSchema>;

export const sendMessageRequestSchema = z.object({
  body: z.string().trim().min(1),
  resources: z.array(resourceRefDTOSchema).optional(),
  resourceType: messageResourceTypeSchema.optional(),
  resourceId: z.number().int().positive().optional(),
});
export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>;

export const conversationUserLiteSchema = z.object({
  id: z.number().int().nonnegative(),
  username: z.string().trim().min(1),
});
export type ConversationUserLiteDTO = z.infer<typeof conversationUserLiteSchema>;

export const conversationResponseSchema = z.object({
  id: z.number().int().nonnegative(),
  user1: conversationUserLiteSchema,
  user2: conversationUserLiteSchema,
  unreadCount: z.number().int().nonnegative().default(0),
  lastMessageAt: z.string().trim().nullable().optional(),
});
export type ConversationResponseDTO = z.infer<typeof conversationResponseSchema>;

export const paginatedConversationsResponseSchema =
  paginatedResponseSchema(conversationResponseSchema);
export type PaginatedConversationsResponseDTO = z.infer<
  typeof paginatedConversationsResponseSchema
>;

export const messageObjectSchema = z.object({
  id: z.number().int().nonnegative(),
  conversationId: z.number().int().nonnegative(),
  senderId: z.number().int().nonnegative(),
  content: z.string().trim().min(1),
  resourceType: messageResourceTypeSchema.nullable().optional(),
  resourceId: z.number().int().nonnegative().nullable().optional(),
  createdAt: z.string().trim().min(1),
  isRead: z.boolean(),
});
export type MessageObjectDTO = z.infer<typeof messageObjectSchema>;

export const paginatedMessagesResponseSchema =
  paginatedResponseSchema(messageObjectSchema);
export type PaginatedMessagesResponseDTO = z.infer<
  typeof paginatedMessagesResponseSchema
>;

export const conversationCreatedResponseSchema = z.object({
  conversationId: z.number().int().nonnegative(),
});
export type ConversationCreatedResponseDTO = z.infer<
  typeof conversationCreatedResponseSchema
>;
