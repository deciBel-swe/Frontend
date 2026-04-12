import { ApiQueryParams, apiRequest } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  PaginatedSearchResponseDTO,
  PaginatedStationResponseDTO,
  TrendingTracksResponseDTO,
} from '@/types/discovery';

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface SearchParams extends PaginationParams {
  q: string;
  type?: 'ALL' | 'TRACKS' | 'USERS' | 'PLAYLISTS';
  genre?: string;
}

export interface TrendingParams {
  genre?: string;
  limit?: number;
}

const toQueryParams = (params?: ApiQueryParams): ApiQueryParams | undefined => {
  if (!params) {
    return undefined;
  }
  return Object.keys(params).length > 0 ? params : undefined;
};

/**
 * Discovery service contract.
 */
export interface DiscoveryService {
  search(params: SearchParams): Promise<PaginatedSearchResponseDTO>;
  getTrending(params?: TrendingParams): Promise<TrendingTracksResponseDTO>;
  getGenreStation(params?: PaginationParams): Promise<PaginatedStationResponseDTO>;
  getArtistStation(params?: PaginationParams): Promise<PaginatedStationResponseDTO>;
  getLikesStation(params?: PaginationParams): Promise<PaginatedStationResponseDTO>;
}

export class RealDiscoveryService implements DiscoveryService {
  async search(params: SearchParams): Promise<PaginatedSearchResponseDTO> {
    return apiRequest(API_CONTRACTS.SEARCH, {
      params: toQueryParams(params),
    });
  }

  async getTrending(
    params?: TrendingParams
  ): Promise<TrendingTracksResponseDTO> {
    return apiRequest(API_CONTRACTS.TRENDING, {
      params: toQueryParams(params),
    });
  }

  async getGenreStation(
    params?: PaginationParams
  ): Promise<PaginatedStationResponseDTO> {
    return apiRequest(API_CONTRACTS.STATIONS_GENRE, {
      params: toQueryParams(params as ApiQueryParams),
    });
  }

  async getArtistStation(
    params?: PaginationParams
  ): Promise<PaginatedStationResponseDTO> {
    return apiRequest(API_CONTRACTS.STATIONS_ARTIST, {
      params: toQueryParams(params as ApiQueryParams),
    });
  }

  async getLikesStation(
    params?: PaginationParams
  ): Promise<PaginatedStationResponseDTO> {
    return apiRequest(API_CONTRACTS.STATIONS_LIKES, {
      params: toQueryParams(params as ApiQueryParams),
    });
  }
}
