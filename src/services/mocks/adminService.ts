import { AdminService } from '../api/adminSerivce';
import type { MessageResponse } from '@/types/user';
import type {
  AdminLoginResponse,
  AdminReportsPage,
  BanUserRequest,
  PlatformAnalyticsResponse,
  ReportRequest,
  UpdateAdminReportStatusRequest,
} from '@/types/admin';

const buildMessage = (message: string): MessageResponse => ({ message });

export class MockAdminService implements AdminService {
  async reportTrack(
    _trackId: number,
    _payload: ReportRequest
  ): Promise<MessageResponse> {
    return buildMessage('Report submitted successfully');
  }

  async reportComment(
    _commentId: number,
    _payload: ReportRequest
  ): Promise<MessageResponse> {
    return buildMessage('Report submitted successfully');
  }

  async adminLogin(): Promise<AdminLoginResponse> {
    return {
      accessToken: 'mock-admin-access-token',
      expiresIn: 3600,
      adminUser: {
        id: 1,
        username: 'admin_system',
        avatarURL: '/images/default_song_image.png',
      },
    };
  }

  async getPlatformReports(): Promise<AdminReportsPage> {
    return {
      content: [
        {
          id: 1,
          targetId: 101,
          reporterId: 42,
          targetType: 'TRACK',
          status: 'OPEN',
          createdAt: '2025-04-01T10:30:00Z',
        },
        {
          id: 2,
          targetId: 77,
          reporterId: 18,
          targetType: 'COMMENT',
          status: 'RESOLVED',
          createdAt: '2025-04-02T09:15:00Z',
        },
      ],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 2,
      totalPages: 1,
      isLast: true,
    };
  }

  async updateReportStatus(
    _reportId: number,
    _payload: UpdateAdminReportStatusRequest
  ): Promise<MessageResponse> {
    return buildMessage('Report status updated successfully');
  }

  async deleteTrackAsModerator(_trackId: number): Promise<MessageResponse> {
    return buildMessage('Track was successfully deleted');
  }

  async banUser(
    _userId: number,
    _payload?: BanUserRequest
  ): Promise<MessageResponse> {
    return buildMessage('User banned successfully');
  }

  async unbanUser(_userId: number): Promise<MessageResponse> {
    return buildMessage('User unbanned successfully');
  }

  async getPlatformAnalytics(): Promise<PlatformAnalyticsResponse> {
    return {
      totalUsers: 0,
      totalTracks: 0,
      totalPlays: 0,
      playThroughRate: 0,
      totalStorageUsedBytes: 0,
      bannedUserCount: 0,
    };
  }
}
