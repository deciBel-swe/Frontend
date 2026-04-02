import type { CommentService, PaginationParams } from '@/services/api/commentService';
import {
  getMockCommentsStore,
  getMockUsersStore,
  persistMockSystemState,
  resolveCurrentMockUserId,
  type MockCommentRecord,
} from './mockSystemStore';
import type {
  Comment,
  CreateCommentRequest,
  PaginatedCommentsResponse,
  PaginatedRepliesResponse,
} from '@/types/comments';

const MOCK_DELAY_MS = 120;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const paginate = <T>(items: T[], params?: PaginationParams) => {
  const pageNumber = Math.max(0, params?.page ?? 0);
  const pageSize = Math.max(1, params?.size ?? 20);
  const totalElements = items.length;
  const totalPages =
    totalElements === 0 ? 1 : Math.ceil(totalElements / pageSize);
  const start = pageNumber * pageSize;
  const content = items.slice(start, start + pageSize);
  const isLast = pageNumber >= totalPages - 1;

  return {
    content,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    isLast,
  };
};

const inMemoryComments = getMockCommentsStore();
const inMemoryUsers = getMockUsersStore();

const resolveCurrentUser = () => {
  const currentUserId = resolveCurrentMockUserId();
  const current = inMemoryUsers.find((user) => user.id === currentUserId);
  if (!current) {
    throw new Error('Current user not found');
  }
  return current;
};

const nextCommentId = (): number => {
  if (inMemoryComments.length === 0) {
    return 1;
  }
  return Math.max(...inMemoryComments.map((comment) => comment.id)) + 1;
};

const toCommentResponse = (comment: MockCommentRecord): Comment => ({
  id: comment.id,
  user: { ...comment.user },
  body: comment.body,
  timestampSeconds: comment.timestampSeconds ?? 0,
  createdAt: comment.createdAt,
});

export class MockCommentService implements CommentService {
  async getTrackComments(
    trackId: number,
    params?: PaginationParams
  ): Promise<PaginatedCommentsResponse> {
    await delay();

    const comments = inMemoryComments
      .filter(
        (comment) =>
          comment.trackId === trackId && !comment.parentCommentId
      )
      .map(toCommentResponse);

    return paginate(comments, params);
  }

  async addTrackComment(
    trackId: number,
    payload: CreateCommentRequest
  ): Promise<Comment> {
    await delay();

    const currentUser = resolveCurrentUser();
    const createdAt = new Date().toISOString();

    const record: MockCommentRecord = {
      id: nextCommentId(),
      trackId,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        avatarUrl: currentUser.profile.profilePic,
      },
      body: payload.body,
      timestampSeconds: payload.timestampSeconds,
      createdAt,
    };

    inMemoryComments.push(record);
    persistMockSystemState();

    return toCommentResponse(record);
  }

  async getCommentReplies(
    commentId: number,
    params?: PaginationParams
  ): Promise<PaginatedRepliesResponse> {
    await delay();

    const replies = inMemoryComments
      .filter((comment) => comment.parentCommentId === commentId)
      .map((comment) => ({
        id: comment.id,
        user: { ...comment.user },
        body: comment.body,
        createdAt: comment.createdAt,
      }));

    return paginate(replies, params);
  }

  async deleteComment(commentId: number): Promise<void> {
    await delay();

    const indexes = inMemoryComments
      .map((comment, index) =>
        comment.id === commentId || comment.parentCommentId === commentId
          ? index
          : -1
      )
      .filter((index) => index >= 0)
      .sort((a, b) => b - a);

    if (indexes.length === 0) {
      throw new Error('Comment not found');
    }

    for (const index of indexes) {
      inMemoryComments.splice(index, 1);
    }

    persistMockSystemState();
  }
}
