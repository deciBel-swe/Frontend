import { apiRequest } from '@/hooks/useAPI';
import { RealCommentService } from '@/services/api/commentService';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { CreateCommentRequest } from '@/types/comments';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('RealCommentService', () => {
  let service: RealCommentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealCommentService();
  });

  it('lists track comments with query params', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.getTrackComments(101, { page: 0, size: 10 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.TRACKS_COMMENTS_LIST(101),
      { params: { page: 0, size: 10 } }
    );
  });

  it('adds a comment via TRACKS_COMMENTS_CREATE contract', async () => {
    const payload: CreateCommentRequest = {
      body: 'Nice drop.',
      timestampSeconds: 42,
    };

    mockedApiRequest.mockResolvedValue({
      id: 900,
      user: { id: 1, username: 'mockuser', avatarUrl: 'https://example.com/a.png' },
      body: 'Nice drop.',
      timestampSeconds: 42,
      createdAt: '2026-04-02T12:00:00.000Z',
    });

    await service.addTrackComment(101, payload);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.TRACKS_COMMENTS_CREATE(101),
      { payload }
    );
  });

  it('lists comment replies with query params', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 5,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.getCommentReplies(1001, { page: 0, size: 5 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.COMMENTS_REPLIES_LIST(1001),
      { params: { page: 0, size: 5 } }
    );
  });

  it('deletes a comment via COMMENTS_DELETE contract', async () => {
    mockedApiRequest.mockResolvedValue(undefined);

    await service.deleteComment(1001);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.COMMENTS_DELETE(1001)
    );
  });
});
