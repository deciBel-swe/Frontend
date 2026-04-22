/**
 * Admin Hooks Barrel Export
 *
 * Re-exports all admin feature hooks from a single location.
 */

/**
 * useAdminLogin — authenticates an admin user and returns admin auth payload.
 */
export { useAdminLogin } from './useAdminLogin';

/**
 * Moderation action hooks.
 */
export { useBanUser } from './useBanUser';
export { useUnbanUser } from './useUnbanUser';
export { useDeleteTrackAsModerator } from './useDeleteTrackAsModerator';

/**
 * Reporting hooks.
 */
export { useReportTrack } from './useReportTrack';
export { useReportComment } from './useReportComment';
export { useUpdateReportStatus } from './useUpdateReportStatus';

/**
 * Admin dashboard data hooks.
 */
export { usePlatformReports } from './usePlatformReports';
export { usePlatformAnalytics } from './usePlatformAnalytics';
