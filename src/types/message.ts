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
  content: z.string().trim().min(1),
  recipientId: z.number().int().nonnegative(),
  resources: z.array(resourceRefDTOSchema).optional(),
  resourceType: messageResourceTypeSchema.optional(),
  resourceId: z.number().int().positive().optional(),
});
export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>;

export const conversationUserLiteSchema = z.object({
  id: z.number().int().nonnegative(),
  username: z.string().trim().min(1),
});
export type ConversationUserLiteDTO = z.infer<
  typeof conversationUserLiteSchema
>;

export const conversationResponseSchema = z.object({
  id: z.number().int().nonnegative(),
  user1: conversationUserLiteSchema,
  user2: conversationUserLiteSchema,
  unreadCount: z.number().int().nonnegative().default(0),
  lastMessageAt: z.string().trim().nullable().optional(),
});
export type ConversationResponseDTO = z.infer<
  typeof conversationResponseSchema
>;

export const paginatedConversationsResponseSchema = paginatedResponseSchema(
  conversationResponseSchema
);
export type PaginatedConversationsResponseDTO = z.infer<
  typeof paginatedConversationsResponseSchema
>;

const stringOrNumber = z.union([z.string(), z.number()]);

export const messageObjectSchema = z.object({
  id: stringOrNumber,
  conversationId: stringOrNumber.optional(),
  senderId: stringOrNumber.optional(),
  sender: z.object({
    id: stringOrNumber.optional(),
    username: z.string().optional(),
    displayName: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional()
  }).optional(),
  content: z.string().optional().default(''),
  resourceType: messageResourceTypeSchema.nullable().optional(),
  resourceId: stringOrNumber.nullable().optional(),
  createdAt: z.string().optional(),
  timestamp: z.string().optional(),
  isRead: z.boolean().optional().default(false),
});
export type MessageObjectDTO = z.infer<typeof messageObjectSchema>;

export const paginatedMessagesResponseSchema =
  paginatedResponseSchema(messageObjectSchema);
export type PaginatedMessagesResponseDTO = z.infer<
  typeof paginatedMessagesResponseSchema
>;

// Accept string IDs returned from the server.
const stringFromString = z.preprocess((val) => {
  if (typeof val === 'number') return String(val);
  return val;
}, z.string().trim().min(1));

export const conversationCreatedResponseSchema = z
  .object({
    conversationId: stringFromString.optional(),
    id: stringFromString.optional(),
  })
  .refine(
    (payload) =>
      payload.conversationId !== undefined || payload.id !== undefined,
    {
      message: 'Response must include either conversationId or id.',
    }
  )
  .transform((payload) => ({
    conversationId: payload.conversationId ?? payload.id!,
  }));
export type ConversationCreatedResponseDTO = z.infer<
  typeof conversationCreatedResponseSchema
>;
