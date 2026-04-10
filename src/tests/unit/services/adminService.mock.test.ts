import { MockAdminService } from '@/services/mocks/adminService';

describe('MockAdminService', () => {
  let service: MockAdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MockAdminService();
  });

  it('reportTrack returns success message', async () => {
    const response = await service.reportTrack(101, {
      reason: 'Copyright Violation',
      description: 'Unauthorized sampling.',
    });

    expect(response).toEqual({ message: 'Report submitted successfully' });
  });

  it('reportComment returns success message', async () => {
    const response = await service.reportComment(88, {
      reason: 'Harassment',
      description: 'Contains offensive language.',
    });

    expect(response).toEqual({ message: 'Report submitted successfully' });
  });

  it('adminLogin returns mock admin auth payload', async () => {
    const response = await service.adminLogin();

    expect(response.accessToken).toBe('mock-admin-access-token');
    expect(response.expiresIn).toBe(3600);
    expect(response.adminUser.id).toBe(1);
    expect(response.adminUser.username).toBe('admin_system');
  });

  it('getPlatformReports returns two reports', async () => {
    const response = await service.getPlatformReports({ page: 0, size: 20 });

    expect(response.content).toHaveLength(2);
    expect(response.totalElements).toBe(2);
    expect(response.pageNumber).toBe(0);
    expect(response.pageSize).toBe(20);
    expect(response.content[0].targetType).toBe('TRACK');
    expect(response.content[1].targetType).toBe('COMMENT');
  });

  it('updateReportStatus returns success message', async () => {
    const response = await service.updateReportStatus(5, {
      status: 'RESOLVED',
    });

    expect(response).toEqual({ message: 'Report status updated successfully' });
  });

  it('deleteTrackAsModerator returns success message', async () => {
    await expect(service.deleteTrackAsModerator(7)).resolves.toEqual({
      message: 'Track was successfully deleted',
    });
  });

  it('banUser returns success message', async () => {
    const response = await service.banUser(52, {
      reason: 'Repeated abusive behavior',
    });

    expect(response).toEqual({ message: 'User banned successfully' });
  });

  it('unbanUser returns success message', async () => {
    const response = await service.unbanUser(52);

    expect(response).toEqual({ message: 'User unbanned successfully' });
  });

  it('getPlatformAnalytics returns aggregate counters', async () => {
    const response = await service.getPlatformAnalytics();

    expect(response).toEqual({
      totalUsers: 0,
      totalTracks: 0,
      totalPlays: 0,
      playThroughRate: 0,
      totalStorageUsedBytes: 0,
      bannedUserCount: 0,
    });
  });
});
