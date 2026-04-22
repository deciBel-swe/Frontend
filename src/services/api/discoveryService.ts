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

export interface GenreStationParams extends PaginationParams {
  genre: string;
}

export interface ArtistStationParams extends PaginationParams {
  artistId: number;
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

export interface SearchRequestOptions {
  signal?: AbortSignal;
}

const toQueryParams = (
  params?:
    | SearchParams
    | TrendingParams
    | GenreStationParams
    | ArtistStationParams
    | PaginationParams
): ApiQueryParams | undefined => {
  if (!params) {
    return undefined;
  }

  return Object.keys(params).length > 0 ? { ...params } : undefined;
};

/**
 * Discovery service contract.
 */
export interface DiscoveryService {
  search(
    params: SearchParams,
    options?: SearchRequestOptions
  ): Promise<PaginatedSearchResponseDTO>;
  getTrending(params?: TrendingParams): Promise<TrendingTracksResponseDTO>;
  getGenreStation(
    params: GenreStationParams
  ): Promise<PaginatedStationResponseDTO>;
  getArtistStation(
    params: ArtistStationParams
  ): Promise<PaginatedStationResponseDTO>;
  getLikesStation(params?: PaginationParams): Promise<PaginatedStationResponseDTO>;
}

export class RealDiscoveryService implements DiscoveryService {
  async search(
    params: SearchParams,
    options?: SearchRequestOptions
  ): Promise<PaginatedSearchResponseDTO> {
    return apiRequest(API_CONTRACTS.SEARCH, {
      params: toQueryParams(params),
      ...(options?.signal ? { signal: options.signal } : {}),
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
    params: GenreStationParams
  ): Promise<PaginatedStationResponseDTO> {
    return apiRequest(API_CONTRACTS.STATIONS_GENRE, {
      params: toQueryParams(params),
    });
  }

  async getArtistStation(
    params: ArtistStationParams
  ): Promise<PaginatedStationResponseDTO> {
    return apiRequest(API_CONTRACTS.STATIONS_ARTIST, {
      params: toQueryParams(params),
    });
  }

  async getLikesStation(
    params?: PaginationParams
  ): Promise<PaginatedStationResponseDTO> {
    return apiRequest(API_CONTRACTS.STATIONS_LIKES, {
      params: toQueryParams(params),
    });
  }
}
