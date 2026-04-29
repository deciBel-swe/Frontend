import {
  adminReportDetailSchema,
  adminReportsPageSchema,
  bannedUsersResponseSchema,
  platformAnalyticsResponseSchema,
} from '@/types/admin';

describe('admin report schemas', () => {
  it('accepts paginated reports responses', () => {
    const parsed = adminReportsPageSchema.parse({
      content: [
        {
          id: 1,
          targetId: 10,
          reporterId: 78,
          targetType: 'TRACK',
          status: 'OPEN',
          createdAt: '2026-04-25T15:55:44.461514',
        },
      ],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 1,
      totalPages: 1,
      isLast: true,
    });

    expect(parsed.totalElements).toBe(1);
    expect(parsed.content[0]?.targetId).toBe(10);
  });

  it('normalizes plain array reports responses into a page object', () => {
    const parsed = adminReportsPageSchema.parse([
      {
        id: 2,
        reporterId: 78,
        targetType: 'COMMENT',
        status: 'OPEN',
        createdAt: '2026-04-25T16:03:35.104603',
      },
      {
        id: 1,
        reporterId: 78,
        targetType: 'TRACK',
        status: 'OPEN',
        createdAt: '2026-04-25T15:55:44.461514',
      },
    ]);

    expect(parsed.content).toHaveLength(2);
    expect(parsed.pageNumber).toBe(0);
    expect(parsed.totalElements).toBe(2);
    expect(parsed.totalPages).toBe(1);
    expect(parsed.isLast).toBe(true);
  });

  it('still requires targetId on report detail responses', () => {
    expect(() =>
      adminReportDetailSchema.parse({
        id: 1,
        reporterId: 78,
        targetType: 'TRACK',
        status: 'OPEN',
        createdAt: '2026-04-25T15:55:44.461514',
      })
    ).toThrow();
  });

  it('maps totalBannedUsers to bannedUserCount for banned users responses', () => {
    const parsed = bannedUsersResponseSchema.parse({
      content: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
      isLast: true,
      totalBannedUsers: 0,
    });

    expect(parsed.bannedUserCount).toBe(0);
  });

  it('defaults analytics bannedUserCount to zero when omitted', () => {
    const parsed = platformAnalyticsResponseSchema.parse({
      totalUsers: 353,
      totalTracks: 67,
      totalPlays: 127,
      playThroughRate: 0.1751243781094527,
      totalStorageUsedBytes: 734430530,
    });

    expect(parsed.bannedUserCount).toBe(0);
  });
});
