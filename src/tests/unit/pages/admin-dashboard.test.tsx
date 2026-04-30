import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AdminAnalyticsPage from '@/app/admin/(dashboard)/analytics/page';
import AdminReportsPage from '@/app/admin/(dashboard)/reports/page';
import AdminUsersPage from '@/app/admin/(dashboard)/users/page';
import {
  useAdminReportDetail,
  useBanUser,
  useBannedUsers,
  useDeleteTrackAsModerator,
  usePlatformAnalytics,
  usePlatformReports,
  useUnbanUser,
  useUpdateReportStatus,
} from '@/features/admin/hooks';

jest.mock('@/features/admin/hooks', () => ({
  useAdminReportDetail: jest.fn(),
  useBanUser: jest.fn(),
  useBannedUsers: jest.fn(),
  usePlatformAnalytics: jest.fn(),
  usePlatformReports: jest.fn(),
  useUpdateReportStatus: jest.fn(),
  useDeleteTrackAsModerator: jest.fn(),
  useUnbanUser: jest.fn(),
}));

describe('Admin dashboard pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useDeleteTrackAsModerator as jest.Mock).mockReturnValue({
      deleteTrackAsModerator: jest.fn(),
      isLoading: false,
      error: null,
    });
    (useBanUser as jest.Mock).mockReturnValue({
      banUser: jest.fn(),
      isLoading: false,
      error: null,
    });
    (useUpdateReportStatus as jest.Mock).mockReturnValue({
      updateReportStatus: jest.fn(),
      isLoading: false,
      error: null,
    });
    (useUnbanUser as jest.Mock).mockReturnValue({
      unbanUser: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });
    (useAdminReportDetail as jest.Mock).mockReturnValue({
      reportDetail: null,
      getReportDetail: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });
    (useBannedUsers as jest.Mock).mockReturnValue({
      users: {
        content: [
          {
            id: 101,
            username: 'listener_101',
            displayName: 'Listener 101',
            avatarUrl: 'https://example.com/avatar-101.jpg',
            isFollowing: false,
            followerCount: 12,
            trackCount: 3,
          },
          {
            id: 205,
            username: 'artist_205',
            displayName: 'Artist 205',
            avatarUrl: 'https://example.com/avatar-205.jpg',
            isFollowing: false,
            followerCount: 84,
            trackCount: 27,
          },
        ],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 2,
        totalPages: 1,
        isLast: true,
        bannedUserCount: 2,
      },
      getBannedUsers: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('renders analytics using documented service metrics', () => {
    (usePlatformAnalytics as jest.Mock).mockReturnValue({
      analytics: {
        totalUsers: 15420,
        totalTracks: 89400,
        totalPlays: 1205000,
        playThroughRate: 68.5,
        totalStorageUsedBytes: 1073741824000,
        bannedUserCount: 5,
      },
      getPlatformAnalytics: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<AdminAnalyticsPage />);

    expect(screen.getByText('Total Tracks')).toBeInTheDocument();
    expect(screen.getByText('89,400')).toBeInTheDocument();
    expect(screen.getByText('68.5%')).toBeInTheDocument();
    expect(screen.getByText('Banned Users')).toBeInTheDocument();
  });

  it('renders users page from the banned-users service response', () => {
    render(<AdminUsersPage />);

    expect(screen.getAllByText(/banned users/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/2 total/i, { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText(/@listener_101/i)).toBeInTheDocument();
    expect(screen.getByText(/@artist_205/i)).toBeInTheDocument();
    expect(screen.getByText('Listener 101')).toBeInTheDocument();
    expect(screen.getByText('84')).toBeInTheDocument();
  });

  it('shows report detail data and suspend action when report details are available', async () => {
    const user = userEvent.setup();

    (usePlatformReports as jest.Mock).mockReturnValue({
      reports: {
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
      },
      getPlatformReports: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });
    (useAdminReportDetail as jest.Mock).mockReturnValue({
      reportDetail: {
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
        targetDisplayName: 'Artist 205',
        targetTitle: 'Track #101',
        targetArtistName: 'Artist 205',
        targetThumbnailUrl: '/images/default_song_image.png',
        targetPlayCount: 3200,
        targetCreatedAt: '2025-03-20T12:00:00Z',
      },
      getReportDetail: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<AdminReportsPage />);

    await user.click(screen.getByRole('button', { name: /view/i }));

    expect(screen.getByText('COPYRIGHT')).toBeInTheDocument();
    expect(screen.getByText('listener_reporter')).toBeInTheDocument();
    expect(screen.getByText('Unauthorized sampling.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suspend user/i })).toBeInTheDocument();
  });

  it('suspends the reported user from the popup when report detail includes a target user', async () => {
    const user = userEvent.setup();
    const banUser = jest.fn().mockResolvedValue({ message: 'User banned' });
    const updateReportStatus = jest
      .fn()
      .mockResolvedValue({ message: 'Report updated' });
    const getPlatformReports = jest.fn().mockResolvedValue(undefined);

    (usePlatformReports as jest.Mock).mockReturnValue({
      reports: {
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
      },
      getPlatformReports,
      isLoading: false,
      isError: false,
      error: null,
    });
    (useAdminReportDetail as jest.Mock).mockReturnValue({
      reportDetail: {
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
      },
      getReportDetail: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });
    (useBanUser as jest.Mock).mockReturnValue({
      banUser,
      isLoading: false,
      error: null,
    });
    (useUpdateReportStatus as jest.Mock).mockReturnValue({
      updateReportStatus,
      isLoading: false,
      error: null,
    });

    render(<AdminReportsPage />);

    await user.click(screen.getByRole('button', { name: /view/i }));
    await user.click(screen.getByRole('button', { name: /suspend user/i }));

    await waitFor(() => {
      expect(banUser).toHaveBeenCalledWith(205);
    });
    expect(updateReportStatus).toHaveBeenCalledWith(1, {
      status: 'RESOLVED',
    });
    expect(getPlatformReports).toHaveBeenCalledWith({ page: 0, size: 20 });
  });

  it('catches report update failures and surfaces the action error', async () => {
    const user = userEvent.setup();
    const updateReportStatus = jest
      .fn()
      .mockRejectedValue(new Error('Report update failed'));

    (usePlatformReports as jest.Mock).mockReturnValue({
      reports: {
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
      },
      getPlatformReports: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });
    (useUpdateReportStatus as jest.Mock).mockReturnValue({
      updateReportStatus,
      isLoading: false,
      error: null,
    });

    render(<AdminReportsPage />);

    await user.click(screen.getByRole('button', { name: /dismiss/i }));

    await waitFor(() => {
      expect(screen.getByText('Report update failed')).toBeInTheDocument();
    });
    expect(updateReportStatus).toHaveBeenCalledWith(1, {
      status: 'DISMISSED',
    });
  });
});
