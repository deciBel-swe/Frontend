import { apiRequest, type ApiQueryParams } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  CreateCommentRequest,
  Comment,
  PaginatedCommentsResponse,
  PaginatedRepliesResponse,
} from '@/types/comments';

export interface PaginationParams {
  page?: number;
  size?: number;
}

const toQueryParams = (
  params?: PaginationParams
): ApiQueryParams | undefined => {
  if (!params) {
    return undefined;
  }

  const query: ApiQueryParams = {};
  if (params.page !== undefined) {
    query.page = params.page;
  }
  if (params.size !== undefined) {
    query.size = params.size;
  }

  return Object.keys(query).length > 0 ? query : undefined;
};

/**
 * Comment service contract.
 *
 * Real and mock implementations must satisfy this interface.
 */
export interface CommentService {
  /** List comments for a track (GET /tracks/:trackId/comments). */
  getTrackComments(
    trackId: number,
    params?: PaginationParams
  ): Promise<PaginatedCommentsResponse>;

  /** Add a comment to a track (POST /tracks/:trackId/comments). */
  addTrackComment(
    trackId: number,
    payload: CreateCommentRequest
  ): Promise<Comment>;

  /** Get replies for a comment (GET /comments/:commentId/replies). */
  getCommentReplies(
    commentId: number,
    params?: PaginationParams
  ): Promise<PaginatedRepliesResponse>;
  replyToComment(
    commentId: number,
    payload: CreateCommentRequest
  ): Promise<Comment>;
  /** Delete a comment (DELETE /comments/:commentId). */
  deleteComment(commentId: number): Promise<void>;
}

/** Real implementation backed by centralized axios + Zod API template. */
export class RealCommentService implements CommentService {
  async getTrackComments(
    trackId: number,
    params?: PaginationParams
  ): Promise<PaginatedCommentsResponse> {
    return apiRequest(API_CONTRACTS.TRACKS_COMMENTS_LIST(trackId), {
      params: toQueryParams(params),
    });
  }
  async replyToComment(
    commentId: number,
    payload: CreateCommentRequest
  ): Promise<Comment> {
    return apiRequest(API_CONTRACTS.COMMENTS_REPLIES_CREATE(commentId), {
      payload,
    });
  }


  async addTrackComment(
    trackId: number,
    payload: CreateCommentRequest
  ): Promise<Comment> {
    return apiRequest(API_CONTRACTS.TRACKS_COMMENTS_CREATE(trackId), {
      payload,
    });
  }

  async getCommentReplies(
    commentId: number,
    params?: PaginationParams
  ): Promise<PaginatedRepliesResponse> {
    return apiRequest(API_CONTRACTS.COMMENTS_REPLIES_LIST(commentId), {
      params: toQueryParams(params),
    });
  }

  async deleteComment(commentId: number): Promise<void> {
    return apiRequest(API_CONTRACTS.COMMENTS_DELETE(commentId));
  }
}
