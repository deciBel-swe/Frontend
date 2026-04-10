import { z } from 'zod';
import { deviceInfoDTOSchema } from './index';

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
    targetType: z.string().trim().min(1),
    status: adminReportStatusSchema,
    createdAt: z.string().trim().min(1),
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

export const banUserRequestSchema = z.object({
  reason: z.string().trim().min(1),
});
export type BanUserRequest = z.infer<typeof banUserRequestSchema>;

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
