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
    const response = await service.getPlatformReports();

    expect(response.content).toHaveLength(2);
    expect(response.totalElements).toBe(2);
    expect(response.pageNumber).toBe(0);
    expect(response.pageSize).toBe(20);
    expect(response.content[0].targetType).toBe('TRACK');
    expect(response.content[1].targetType).toBe('COMMENT');
  });

  it('getReportById returns a detailed mock report', async () => {
    const response = await service.getReportById(1);

    expect(response.reason).toBe('COPYRIGHT');
    expect(response.description).toBe('This track samples my original work without permission.');
    expect(response.targetUserId).toBe(205);
  });

  it('updateReportStatus returns success message', async () => {
    const response = await service.updateReportStatus(5, {
      status: 'RESOLVED',
    });

    expect(response).toEqual({ message: 'Report status updated successfully' });
  });

  it('deleteTrackAsModerator returns success message', async () => {
    await expect(service.deleteTrackAsModerator(7)).resolves.toEqual({
      message: 'Track deleted successfully',
    });
  });

  it('getBannedUsers returns the mocked banned-user page', async () => {
    const response = await service.getBannedUsers();

    expect(response.content).toHaveLength(3);
    expect(response.bannedUserCount).toBe(3);
    expect(response.content[0].displayName).toBe('Listener 101');
  });

  it('banUser returns success message', async () => {
    const response = await service.banUser(52);

    expect(response).toEqual({ message: 'User banned successfully' });
  });

  it('unbanUser returns success message', async () => {
    const response = await service.unbanUser(52);

    expect(response).toEqual({ message: 'User unbanned successfully' });
  });

  it('getPlatformAnalytics returns aggregate counters', async () => {
    const response = await service.getPlatformAnalytics();

    expect(response).toEqual({
      totalUsers: 15420,
      totalTracks: 89400,
      totalPlays: 1205000,
      playThroughRate: 68.5,
      totalStorageUsedBytes: 939433759,
      totalStorageCapacityBytes: 53687091200,
      bannedUserCount: 3,
    });
  });
});
