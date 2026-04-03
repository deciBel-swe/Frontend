import { z } from 'zod';
import { imageWithDefault } from './user';
import { DEFAULT_PROFILE_AVATAR_IMAGE } from './user';
// ================================
// Comment User
// ================================

export const commentUserSchema = z.object({
  id: z.number().int().nonnegative(),
  username: z.string().trim().min(1),
  avatarUrl: imageWithDefault(DEFAULT_PROFILE_AVATAR_IMAGE),
});
export type CommentUser = z.infer<typeof commentUserSchema>;

// ================================
// Comments
// ================================

export const commentSchema = z.object({
  id: z.number().int().nonnegative(),
  user: commentUserSchema,
  body: z.string().min(1),
  timestampSeconds: z.number().int().nonnegative().nullable().optional().default(null),
  createdAt: z.string().trim().min(1),
});
export type Comment = z.infer<typeof commentSchema>;

export const replyCommentSchema = z.object({
  id: z.number().int().nonnegative(),
  user: commentUserSchema,
  body: z.string().min(1),
  timestampSeconds: z.number().int().nonnegative().nullable().optional().default(0),
  createdAt: z.string().trim().min(1),
});
export type ReplyComment = z.infer<typeof replyCommentSchema>;

// ================================
// Requests
// ================================

/** DTO sent to POST /tracks/:trackId/comments */
export const createCommentRequestSchema = z.object({
  body: z.string().min(1),
  timestampSeconds: z.number().int().nonnegative(),
});
export type CreateCommentRequest = z.infer<
  typeof createCommentRequestSchema
>;

// ================================
// Responses
// ================================

export const paginatedCommentsResponseSchema = z.object({
  content: z.array(commentSchema),
  pageNumber: z.number().int().nonnegative(),
  pageSize: z.number().int().nonnegative(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  isLast: z.boolean(),
});
export type PaginatedCommentsResponse = z.infer<
  typeof paginatedCommentsResponseSchema
>;

export const paginatedRepliesResponseSchema = z.object({
  content: z.array(replyCommentSchema),
  pageNumber: z.number().int().nonnegative(),
  pageSize: z.number().int().nonnegative(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  isLast: z.boolean(),
});
export type PaginatedRepliesResponse = z.infer<
  typeof paginatedRepliesResponseSchema
>;
