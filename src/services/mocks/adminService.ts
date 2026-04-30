import { AdminService } from '../api/adminSerivce';

import type { MessageResponse } from '@/types/user';
import type {
  AdminLoginResponse,
  AdminReportDetail,
  AdminReportsPage,
  BannedUsersResponse,
  PlatformAnalyticsResponse,
  ReportRequest,
  UpdateAdminReportStatusRequest,
} from '@/types/admin';

const buildMessage = (message: string): MessageResponse => ({ message });

type MutableMockReport = AdminReportsPage['content'][number];

const INITIAL_REPORTS: MutableMockReport[] = [
  {
    id: 1,
    targetId: 101,
    reporterId: 42,
    reporterUsername: 'listener_reporter',
    targetType: 'TRACK',
    status: 'OPEN',
    createdAt: '2025-04-01T10:30:00Z',
    reason: 'COPYRIGHT',
  },
  {
    id: 2,
    targetId: 77,
    reporterId: 18,
    reporterUsername: 'comment_reporter',
    targetType: 'COMMENT',
    status: 'RESOLVED',
    createdAt: '2025-04-02T09:15:00Z',
    reason: 'INAPPROPRIATE',
  },
];

const REPORT_DETAILS: Record<number, AdminReportDetail> = {
  1: {
    id: 1,
    targetId: 101,
    reporterId: 42,
    reporterUsername: 'listener_reporter',
    targetType: 'TRACK',
    status: 'OPEN',
    createdAt: '2025-04-01T10:30:00Z',
    reason: 'COPYRIGHT',
    description: 'This track samples my original work without permission.',
    targetUserId: 205,
    targetUsername: 'artist_205',
    targetDisplayName: 'Artist 205',
    targetTitle: 'Track #101',
    targetArtistName: 'Artist 205',
    targetThumbnailUrl: '/images/default_song_image.png',
    targetPlayCount: 3200,
    targetCreatedAt: '2025-03-20T12:00:00Z',
  },
  2: {
    id: 2,
    targetId: 77,
    reporterId: 18,
    reporterUsername: 'comment_reporter',
    targetType: 'COMMENT',
    status: 'RESOLVED',
    createdAt: '2025-04-02T09:15:00Z',
    reason: 'INAPPROPRIATE',
    description: 'Contains abusive language.',
    targetUserId: 330,
    targetUsername: 'listener_330',
    targetDisplayName: 'Listener 330',
    commentAuthor: 'listener_330',
    commentContent: 'This is a harmful comment.',
    targetTitle: 'Track #77',
    targetCreatedAt: '2025-04-02T09:10:00Z',
  },
};

const INITIAL_BANNED_USERS: BannedUsersResponse['content'] = [
  {
    id: 101,
    username: 'listener_101',
    displayName: 'Listener 101',
    avatarUrl: 'https://example.com/avatars/listener_101.jpg',
    isFollowing: false,
    followerCount: 12,
    trackCount: 3,
  },
  {
    id: 205,
    username: 'artist_205',
    displayName: 'Artist 205',
    avatarUrl: 'https://example.com/avatars/artist_205.jpg',
    isFollowing: false,
    followerCount: 84,
    trackCount: 27,
  },
  {
    id: 330,
    username: 'listener_330',
    displayName: 'Listener 330',
    avatarUrl: 'https://example.com/avatars/listener_330.jpg',
    isFollowing: false,
    followerCount: 6,
    trackCount: 1,
  },
];

let bannedUserCount = INITIAL_BANNED_USERS.length;
let reportsState: MutableMockReport[] = INITIAL_REPORTS.map((report) => ({
  ...report,
}));
let bannedUsersState: BannedUsersResponse['content'] = INITIAL_BANNED_USERS.map(
  (user) => ({ ...user })
);

const syncBannedUserCount = () => {
  bannedUserCount = bannedUsersState.length;
};

export class MockAdminService implements AdminService {
  constructor() {
    reportsState = INITIAL_REPORTS.map((report) => ({ ...report }));
    bannedUsersState = INITIAL_BANNED_USERS.map((user) => ({ ...user }));
    syncBannedUserCount();
  }

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

  async getPlatformReports(params?: {
    page?: number;
    size?: number;
  }): Promise<AdminReportsPage> {
    const pageNumber = Math.max(0, params?.page ?? 0);
    const pageSize = Math.max(1, params?.size ?? 20);
    const totalElements = reportsState.length;
    const totalPages =
      totalElements === 0 ? 1 : Math.ceil(totalElements / pageSize);
    const start = pageNumber * pageSize;

    return {
      content: reportsState.slice(start, start + pageSize),
      pageNumber,
      pageSize,
      totalElements,
      totalPages,
      isLast: pageNumber >= totalPages - 1,
    };
  }

  async getReportById(reportId: number): Promise<AdminReportDetail> {
    const detail = REPORT_DETAILS[reportId];

    if (detail) {
      return { ...detail };
    }

    const fallback = reportsState.find((report) => report.id === reportId);

    if (!fallback || fallback.targetId === undefined) {
      throw new Error('Report not found');
    }

    return { ...fallback, targetId: fallback.targetId };
  }

  async getBannedUsers(params?: {
    page?: number;
    size?: number;
  }): Promise<BannedUsersResponse> {
    const pageNumber = Math.max(0, params?.page ?? 0);
    const pageSize = Math.max(1, params?.size ?? 20);
    const totalElements = bannedUsersState.length;
    const totalPages =
      totalElements === 0 ? 1 : Math.ceil(totalElements / pageSize);
    const start = pageNumber * pageSize;

    syncBannedUserCount();

    return {
      content: bannedUsersState.slice(start, start + pageSize),
      pageNumber,
      pageSize,
      totalElements,
      totalPages,
      isLast: pageNumber >= totalPages - 1,
      bannedUserCount,
    };
  }

  async updateReportStatus(
    reportId: number,
    payload: UpdateAdminReportStatusRequest
  ): Promise<MessageResponse> {
    const report = reportsState.find((entry) => entry.id === reportId);

    if (report) {
      report.status = payload.status;
    }

    return buildMessage('Report status updated successfully');
  }

  async deleteTrackAsModerator(trackId: number): Promise<MessageResponse> {
    const report = reportsState.find(
      (entry) => entry.targetType === 'TRACK' && entry.targetId === trackId
    );

    if (report) {
      report.status = 'RESOLVED';
    }

    return buildMessage('Track deleted successfully');
  }

  async banUser(userId: number): Promise<MessageResponse> {
    const existingUser = bannedUsersState.find((user) => user.id === userId);

    if (!existingUser) {
      bannedUsersState = [
        {
          id: userId,
          username: `user_${userId}`,
          displayName: `User ${userId}`,
          avatarUrl: 'https://example.com/avatars/default.jpg',
          isFollowing: false,
          followerCount: 0,
          trackCount: 0,
        },
        ...bannedUsersState,
      ];
    }

    syncBannedUserCount();
    return buildMessage('User banned successfully');
  }

  async unbanUser(userId: number): Promise<MessageResponse> {
    bannedUsersState = bannedUsersState.filter((user) => user.id !== userId);
    syncBannedUserCount();
    return buildMessage('User unbanned successfully');
  }

  async getPlatformAnalytics(): Promise<PlatformAnalyticsResponse> {
    return {
      totalUsers: 15420,
      totalTracks: 89400,
      totalPlays: 1205000,
      playThroughRate: 68.5,
      totalStorageUsedBytes: 939433759,
      totalStorageCapacityBytes: 53687091200,
      bannedUserCount,
    };
  }
}
