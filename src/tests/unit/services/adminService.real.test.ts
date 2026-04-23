import { apiRequest, normalizeApiError } from '@/hooks/useAPI';
import { RealAdminService } from '@/services/api/adminSerivce';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  AdminLoginResponse,
  AdminReportDetail,
  AdminReportsPage,
  BannedUsersResponse,
  PlatformAnalyticsResponse,
  ReportRequest,
} from '@/types/admin';
import type { MessageResponse } from '@/types/user';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
  normalizeApiError: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockedNormalizeApiError = normalizeApiError as jest.MockedFunction<
  typeof normalizeApiError
>;

describe('RealAdminService', () => {
  let service: RealAdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealAdminService();
  });

  it('reportTrack calls TRACK_REPORT with track id and payload', async () => {
    const payload: ReportRequest = {
      reason: 'Copyright Violation',
      description: 'This samples my song without permission.',
    };
    const response: MessageResponse = {
      message: 'Report submitted successfully',
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.reportTrack(101, payload);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.TRACK_REPORT(101),
      { payload }
    );
  });

  it('reportComment calls COMMENT_REPORT with comment id and payload', async () => {
    const payload: ReportRequest = {
      reason: 'Harassment',
      description: 'Offensive language targeting another user.',
    };
    const response: MessageResponse = {
      message: 'Report submitted successfully',
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.reportComment(77, payload);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.COMMENT_REPORT(77),
      { payload }
    );
  });

  it('adminLogin calls ADMIN_LOGIN with payload', async () => {
    const payload = {
      email: 'admin@decibel.foo',
      password: 'hashed-password',
      deviceInfo: {
        deviceType: 'DESKTOP' as const,
        fingerPrint: 'browser-fingerprint-string',
        deviceName: 'Chrome on Windows',
      },
    };
    const response: AdminLoginResponse = {
      accessToken: 'mock-access-token',
      expiresIn: 3600,
      adminUser: {
        id: 1,
        username: 'admin_system',
        avatarURL: 'image-URL',
      },
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.adminLogin(payload);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.ADMIN_LOGIN, {
      payload,
    });
  });

  it('getPlatformReports calls ADMIN_REPORTS with pagination params', async () => {
    const response: AdminReportsPage = {
      content: [
        {
          id: 1,
          targetId: 101,
          reporterId: 42,
          targetType: 'TRACK',
          status: 'OPEN',
          createdAt: '2025-04-01T10:30:00Z',
        },
      ],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 1,
      totalPages: 1,
      isLast: true,
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getPlatformReports({ page: 0, size: 20 });

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.ADMIN_REPORTS, {
      params: { page: 0, size: 20 },
    });
  });

  it('updateReportStatus calls ADMIN_UPDATE_REPORT_STATUS with payload', async () => {
    const payload = { status: 'RESOLVED' as const };
    const response: MessageResponse = {
      message: 'Report status updated successfully',
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.updateReportStatus(8, payload);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.ADMIN_UPDATE_REPORT_STATUS(8),
      { payload }
    );
  });

  it('getBannedUsers calls ADMIN_BANNED_USERS with pagination params', async () => {
    const response: BannedUsersResponse = {
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
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getBannedUsers({ page: 0, size: 20 });

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.ADMIN_BANNED_USERS,
      {
        params: { page: 0, size: 20 },
      }
    );
  });

  it('getReportById calls ADMIN_REPORT_BY_ID', async () => {
    const response: AdminReportDetail = {
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
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getReportById(1);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.ADMIN_REPORT_BY_ID(1)
    );
  });

  it('deleteTrackAsModerator calls ADMIN_DELETE_TRACK', async () => {
    const response: MessageResponse = {
      message: 'Track was successfully deleted',
    };
    mockedApiRequest.mockResolvedValue(response);

    await expect(service.deleteTrackAsModerator(22)).resolves.toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.ADMIN_DELETE_TRACK(22)
    );
  });

  it('banUser calls ADMIN_UPDATE_USER_BAN_STATUS with banned=true', async () => {
    const response: MessageResponse = { message: 'User banned successfully' };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.banUser(52);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.ADMIN_UPDATE_USER_BAN_STATUS(52),
      { payload: { banned: true } }
    );
  });

  it('unbanUser calls ADMIN_UPDATE_USER_BAN_STATUS with banned=false', async () => {
    const response: MessageResponse = { message: 'User unbanned successfully' };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.unbanUser(52);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.ADMIN_UPDATE_USER_BAN_STATUS(52),
      { payload: { banned: false } }
    );
  });

  it('getPlatformAnalytics calls ADMIN_ANALYTICS', async () => {
    const response: PlatformAnalyticsResponse = {
      totalUsers: 15420,
      totalTracks: 89400,
      totalPlays: 1205000,
      playThroughRate: 68.5,
      totalStorageUsedBytes: 1073741824000,
      bannedUserCount: 5,
    };
    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getPlatformAnalytics();

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.ADMIN_ANALYTICS
    );
  });

  it('normalizes and rethrows errors from reportTrack', async () => {
    const requestError = new Error('network fail');
    const normalizedError = {
      statusCode: 401,
      message: 'Access token has expired',
      error: 'Unauthorized',
    };
    mockedApiRequest.mockRejectedValue(requestError);
    mockedNormalizeApiError.mockReturnValue(normalizedError);

    await expect(service.reportTrack(101, { reason: 'Spam' })).rejects.toEqual(
      normalizedError
    );
    expect(mockedNormalizeApiError).toHaveBeenCalledWith(requestError);
  });
});
