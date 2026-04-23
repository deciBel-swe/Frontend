import { z } from 'zod';
import { deviceInfoDTOSchema } from './index';
import { userSummarySchema } from './user';

export const reportRequestSchema = z.object({
  reason: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
});
export type ReportRequest = z.infer<typeof reportRequestSchema>;

export const adminReportStatusSchema = z.enum([
  'OPEN',
  'IN_REVIEW',
  'RESOLVED',
  'DISMISSED',
]);
export type AdminReportStatus = z.infer<typeof adminReportStatusSchema>;

export const updateAdminReportStatusRequestSchema = z.object({
  status: adminReportStatusSchema,
});
export type UpdateAdminReportStatusRequest = z.infer<
  typeof updateAdminReportStatusRequestSchema
>;

export const adminLoginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  deviceInfo: deviceInfoDTOSchema,
});
export type AdminLoginRequest = z.infer<typeof adminLoginRequestSchema>;

export const adminUserSummarySchema = z.object({
  id: z.number().int().nonnegative(),
  username: z.string().trim().min(1),
  avatarURL: z.string().trim().nullable().optional(),
  avatarUrl: z.string().trim().nullable().optional(),
});
export type AdminUserSummary = z.infer<typeof adminUserSummarySchema>;

export const adminLoginResponseSchema = z.object({
  accessToken: z.string().trim().min(1),
  expiresIn: z.number().int().positive(),
  adminUser: adminUserSummarySchema,
});
export type AdminLoginResponse = z.infer<typeof adminLoginResponseSchema>;

export const adminReportSchema = z
  .object({
    id: z.number().int().nonnegative().optional(),
    targetId: z.number().int().nonnegative(),
    reporterId: z.number().int().nonnegative(),
    reporterUsername: z.string().trim().min(1).nullable().optional(),
    targetType: z.string().trim().min(1),
    status: adminReportStatusSchema,
    createdAt: z.string().trim().min(1),
    reason: z.string().trim().min(1).nullable().optional(),
  })
  .passthrough();
export type AdminReport = z.infer<typeof adminReportSchema>;

export const adminReportsPageSchema = z.object({
  content: z.array(adminReportSchema),
  pageNumber: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  isLast: z.boolean(),
});
export type AdminReportsPage = z.infer<typeof adminReportsPageSchema>;

export const adminReportDetailSchema = adminReportSchema
  .extend({
    reason: z.string().trim().min(1).nullable().optional(),
    description: z.string().trim().nullable().optional(),
    reporterUsername: z.string().trim().min(1).nullable().optional(),
    targetUserId: z.number().int().nonnegative().nullable().optional(),
    targetUsername: z.string().trim().min(1).nullable().optional(),
    targetDisplayName: z.string().trim().min(1).nullable().optional(),
    targetTitle: z.string().trim().min(1).nullable().optional(),
    targetArtistName: z.string().trim().min(1).nullable().optional(),
    targetThumbnailUrl: z.string().trim().nullable().optional(),
    targetPlayCount: z.number().int().nonnegative().nullable().optional(),
    targetCreatedAt: z.string().trim().min(1).nullable().optional(),
    commentContent: z.string().trim().nullable().optional(),
    commentAuthor: z.string().trim().min(1).nullable().optional(),
  })
  .passthrough();
export type AdminReportDetail = z.infer<typeof adminReportDetailSchema>;

export const updateUserBanStatusRequestSchema = z.object({
  banned: z.boolean(),
});
export type UpdateUserBanStatusRequest = z.infer<
  typeof updateUserBanStatusRequestSchema
>;

export const bannedUsersResponseSchema = z
  .object({
    content: z.array(userSummarySchema).optional().default([]),
    pageNumber: z.number().int().nonnegative().optional(),
    pageSize: z.number().int().positive().optional(),
    totalElements: z.number().int().nonnegative().optional(),
    totalPages: z.number().int().nonnegative().optional(),
    isLast: z.boolean().optional(),
    bannedUserCount: z.number().int().nonnegative(),
  })
  .passthrough();
export type BannedUsersResponse = z.infer<typeof bannedUsersResponseSchema>;

export const platformAnalyticsResponseSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  totalTracks: z.number().int().nonnegative(),
  totalPlays: z.number().int().nonnegative(),
  playThroughRate: z.number().nonnegative(),
  totalStorageUsedBytes: z.number().int().nonnegative(),
  bannedUserCount: z.number().int().nonnegative(),
});
export type PlatformAnalyticsResponse = z.infer<
  typeof platformAnalyticsResponseSchema
>;

export const emptyActionSchema = z
  .unknown()
  .optional()
  .transform(() => undefined);
