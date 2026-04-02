import { PaginatedTrackFeedResponse } from '@/types/feed';
import { ApiQueryParams, apiRequest } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
export interface FeedService {
  getfeed(params?: PaginationParams): Promise<PaginatedTrackFeedResponse>;
}

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
export class RealFeedService implements FeedService {
  async getfeed(
    params?: PaginationParams
  ): Promise<PaginatedTrackFeedResponse> {
    return apiRequest(API_CONTRACTS.FEED, { params: toQueryParams(params) });
  }
}
