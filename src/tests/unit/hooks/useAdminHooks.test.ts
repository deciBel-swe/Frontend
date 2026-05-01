import { act, renderHook, waitFor } from '@testing-library/react';

import { normalizeApiError } from '@/hooks/useAPI';
import { adminService } from '@/services';
import { useAdminLogin } from '@/features/admin/hooks/useAdminLogin';
import { useAdminReportDetail } from '@/features/admin/hooks/useAdminReportDetail';
import { useBanUser } from '@/features/admin/hooks/useBanUser';
import { useBannedUsers } from '@/features/admin/hooks/useBannedUsers';
import { useDeleteTrackAsModerator } from '@/features/admin/hooks/useDeleteTrackAsModerator';
import { usePlatformAnalytics } from '@/features/admin/hooks/usePlatformAnalytics';
import { usePlatformReports } from '@/features/admin/hooks/usePlatformReports';
import { useReportComment } from '@/features/admin/hooks/useReportComment';
import { useReportTrack } from '@/features/admin/hooks/useReportTrack';
import { useUnbanUser } from '@/features/admin/hooks/useUnbanUser';
import { useUpdateReportStatus } from '@/features/admin/hooks/useUpdateReportStatus';

jest.mock('@/services', () => ({
  adminService: {
    reportTrack: jest.fn(),
    reportComment: jest.fn(),
    adminLogin: jest.fn(),
    getPlatformReports: jest.fn(),
    getReportById: jest.fn(),
    getBannedUsers: jest.fn(),
    updateReportStatus: jest.fn(),
    deleteTrackAsModerator: jest.fn(),
    banUser: jest.fn(),
    unbanUser: jest.fn(),
    getPlatformAnalytics: jest.fn(),
  },
}));

jest.mock('@/hooks/useAPI', () => ({
  normalizeApiError: jest.fn(),
}));

const mockAdminService = adminService as jest.Mocked<typeof adminService>;
const mockNormalizeApiError = normalizeApiError as jest.MockedFunction<
  typeof normalizeApiError
>;

describe('admin hooks', () => {
  const normalizedError = { statusCode: 500, message: 'normalized error' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNormalizeApiError.mockReturnValue(normalizedError);
  });

  it('useAdminLogin returns admin login response on success', async () => {
    const payload = {
      email: 'admin@decibel.dev',
      password: 'strong-password',
      deviceInfo: {
        deviceType: 'WEB' as const,
        fingerPrint: 'fp-123',
        deviceName: 'Chrome on Windows',
      },
    };

    const response = {
      accessToken: 'access-token',
      expiresIn: 3600,
      adminUser: {
        id: 1,
        username: 'admin',
      },
    };

    mockAdminService.adminLogin.mockResolvedValue(response as never);

    const { result } = renderHook(() => useAdminLogin());

    await act(async () => {
      await result.current.adminLogin(payload);
    });

    expect(mockAdminService.adminLogin).toHaveBeenCalledWith(payload);
    expect(result.current.adminLoginResponse).toEqual(response);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('useAdminLogin normalizes and rethrows errors', async () => {
    const rawError = new Error('login failed');
    mockAdminService.adminLogin.mockRejectedValue(rawError);

    const { result } = renderHook(() => useAdminLogin());

    await act(async () => {
      await expect(
        result.current.adminLogin({
          email: 'admin@decibel.dev',
          password: 'bad-password',
          deviceInfo: {
            deviceType: 'WEB',
            fingerPrint: 'fp-404',
            deviceName: 'Edge',
          },
        })
      ).rejects.toEqual(normalizedError);
    });

    expect(mockNormalizeApiError).toHaveBeenCalledWith(rawError);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(normalizedError);
  });

  it('usePlatformReports loads reports on mount and supports override params', async () => {
    const firstPage = {
      content: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
      isLast: true,
    };

    const secondPage = {
      ...firstPage,
      pageNumber: 2,
      pageSize: 5,
    };

    mockAdminService.getPlatformReports
      .mockResolvedValueOnce(firstPage as never)
      .mockResolvedValueOnce(secondPage as never);

    const { result } = renderHook(() =>
      usePlatformReports({ page: 0, size: 20 })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAdminService.getPlatformReports).toHaveBeenNthCalledWith(1, {
      page: 0,
      size: 20,
    });
    expect(result.current.reports).toEqual(firstPage);

    await act(async () => {
      await result.current.getPlatformReports({ page: 2, size: 5 });
    });

    expect(mockAdminService.getPlatformReports).toHaveBeenNthCalledWith(2, {
      page: 2,
      size: 5,
    });
    expect(result.current.reports).toEqual(secondPage);
  });

  it('usePlatformReports sets normalized error state when manual refetch fails', async () => {
    const initialPage = {
      content: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
      isLast: true,
    };
    const rawError = new Error('reports failed');

    mockAdminService.getPlatformReports
      .mockResolvedValueOnce(initialPage as never)
      .mockRejectedValueOnce(rawError);

    const { result } = renderHook(() => usePlatformReports());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.getPlatformReports()).rejects.toEqual(
        normalizedError
      );
    });

    expect(mockNormalizeApiError).toHaveBeenCalledWith(rawError);
    expect(result.current.reports).toEqual(initialPage);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(normalizedError);
  });

  it('useBannedUsers loads banned users on mount and allows refetch', async () => {
    const firstPage = {
      content: [
        {
          id: 101,
          username: 'listener_101',
          displayName: 'Listener 101',
          avatarUrl: 'https://example.com/avatar.jpg',
          isFollowing: false,
          followerCount: 12,
          trackCount: 3,
        },
      ],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 1,
      totalPages: 1,
      isLast: true,
      bannedUserCount: 1,
    };
    const secondPage = {
      ...firstPage,
      pageNumber: 1,
      pageSize: 10,
    };

    mockAdminService.getBannedUsers
      .mockResolvedValueOnce(firstPage as never)
      .mockResolvedValueOnce(secondPage as never);

    const { result } = renderHook(() => useBannedUsers({ page: 0, size: 20 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAdminService.getBannedUsers).toHaveBeenNthCalledWith(1, {
      page: 0,
      size: 20,
    });
    expect(result.current.users).toEqual(firstPage);

    await act(async () => {
      await result.current.getBannedUsers({ page: 1, size: 10 });
    });

    expect(mockAdminService.getBannedUsers).toHaveBeenNthCalledWith(2, {
      page: 1,
      size: 10,
    });
    expect(result.current.users).toEqual(secondPage);
  });

  it('useAdminReportDetail loads report details on mount', async () => {
    const detail = {
      id: 1,
      targetId: 101,
      reporterId: 42,
      reporterUsername: 'listener_reporter',
      targetType: 'TRACK',
      status: 'OPEN',
      createdAt: '2025-04-01T10:30:00Z',
      reason: 'COPYRIGHT',
      description: 'Unauthorized sampling.',
      targetUserId: 205,
    };

    mockAdminService.getReportById.mockResolvedValue(detail as never);

    const { result } = renderHook(() => useAdminReportDetail(1));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAdminService.getReportById).toHaveBeenCalledWith(1);
    expect(result.current.reportDetail).toEqual(detail);
  });

  it('usePlatformAnalytics loads analytics on mount and allows refetch', async () => {
    const firstAnalytics = {
      totalUsers: 10,
      totalTracks: 20,
      totalPlays: 100,
      playThroughRate: 0.42,
      totalStorageUsedBytes: 2048,
      totalStorageCapacityBytes: 4096,
      bannedUserCount: 1,
    };

    const secondAnalytics = {
      ...firstAnalytics,
      totalUsers: 11,
    };

    mockAdminService.getPlatformAnalytics
      .mockResolvedValueOnce(firstAnalytics as never)
      .mockResolvedValueOnce(secondAnalytics as never);

    const { result } = renderHook(() => usePlatformAnalytics());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAdminService.getPlatformAnalytics).toHaveBeenCalledTimes(1);
    expect(result.current.analytics).toEqual(firstAnalytics);

    await act(async () => {
      await result.current.getPlatformAnalytics();
    });

    expect(mockAdminService.getPlatformAnalytics).toHaveBeenCalledTimes(2);
    expect(result.current.analytics).toEqual(secondAnalytics);
  });

  it('usePlatformAnalytics sets normalized error state when manual refetch fails', async () => {
    const initialAnalytics = {
      totalUsers: 10,
      totalTracks: 20,
      totalPlays: 100,
      playThroughRate: 0.42,
      totalStorageUsedBytes: 2048,
      totalStorageCapacityBytes: 4096,
      bannedUserCount: 1,
    };
    const rawError = new Error('analytics failed');

    mockAdminService.getPlatformAnalytics
      .mockResolvedValueOnce(initialAnalytics as never)
      .mockRejectedValueOnce(rawError);

    const { result } = renderHook(() => usePlatformAnalytics());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.getPlatformAnalytics()).rejects.toEqual(
        normalizedError
      );
    });

    expect(mockNormalizeApiError).toHaveBeenCalledWith(rawError);
    expect(result.current.analytics).toEqual(initialAnalytics);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(normalizedError);
  });

  it('useReportTrack returns report track response on success', async () => {
    const response = { message: 'Track reported' };
    mockAdminService.reportTrack.mockResolvedValue(response as never);

    const { result } = renderHook(() => useReportTrack());

    await act(async () => {
      await result.current.reportTrack(101, { reason: 'Spam' });
    });

    expect(mockAdminService.reportTrack).toHaveBeenCalledWith(101, {
      reason: 'Spam',
    });
    expect(result.current.reportTrackResponse).toEqual(response);
    expect(result.current.isError).toBe(false);
  });

  it('useReportTrack normalizes and rethrows errors', async () => {
    const rawError = new Error('report track failed');
    mockAdminService.reportTrack.mockRejectedValue(rawError);

    const { result } = renderHook(() => useReportTrack());

    await act(async () => {
      await expect(
        result.current.reportTrack(101, { reason: 'Copyright Violation' })
      ).rejects.toEqual(normalizedError);
    });

    expect(mockNormalizeApiError).toHaveBeenCalledWith(rawError);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(normalizedError);
  });

  it('useReportComment returns report comment response on success', async () => {
    const response = { message: 'Comment reported' };
    mockAdminService.reportComment.mockResolvedValue(response as never);

    const { result } = renderHook(() => useReportComment());

    await act(async () => {
      await result.current.reportComment(77, { reason: 'Harassment' });
    });

    expect(mockAdminService.reportComment).toHaveBeenCalledWith(77, {
      reason: 'Harassment',
    });
    expect(result.current.reportCommentResponse).toEqual(response);
    expect(result.current.isError).toBe(false);
  });

  it('useUpdateReportStatus returns update response on success', async () => {
    const response = { message: 'Report updated' };
    mockAdminService.updateReportStatus.mockResolvedValue(response as never);

    const { result } = renderHook(() => useUpdateReportStatus());

    await act(async () => {
      await result.current.updateReportStatus(8, { status: 'RESOLVED' });
    });

    expect(mockAdminService.updateReportStatus).toHaveBeenCalledWith(8, {
      status: 'RESOLVED',
    });
    expect(result.current.updateReportStatusResponse).toEqual(response);
    expect(result.current.isError).toBe(false);
  });

  it('useDeleteTrackAsModerator returns delete response on success', async () => {
    const response = { message: 'Track deleted' };
    mockAdminService.deleteTrackAsModerator.mockResolvedValue(
      response as never
    );

    const { result } = renderHook(() => useDeleteTrackAsModerator());

    await act(async () => {
      await result.current.deleteTrackAsModerator(22);
    });

    expect(mockAdminService.deleteTrackAsModerator).toHaveBeenCalledWith(22);
    expect(result.current.deleteTrackResponse).toEqual(response);
    expect(result.current.isError).toBe(false);
  });

  it('useBanUser returns ban response on success', async () => {
    const response = { message: 'User banned' };
    mockAdminService.banUser.mockResolvedValue(response as never);

    const { result } = renderHook(() => useBanUser());

    await act(async () => {
      await result.current.banUser(52);
    });

    expect(mockAdminService.banUser).toHaveBeenCalledWith(52);
    expect(result.current.banUserResponse).toEqual(response);
    expect(result.current.isError).toBe(false);
  });

  it('useUnbanUser returns unban response on success', async () => {
    const response = { message: 'User unbanned' };
    mockAdminService.unbanUser.mockResolvedValue(response as never);

    const { result } = renderHook(() => useUnbanUser());

    await act(async () => {
      await result.current.unbanUser(52);
    });

    expect(mockAdminService.unbanUser).toHaveBeenCalledWith(52);
    expect(result.current.unbanUserResponse).toEqual(response);
    expect(result.current.isError).toBe(false);
  });
});
