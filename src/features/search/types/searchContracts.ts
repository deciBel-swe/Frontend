import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import type { TrackCardProps } from '@/components/tracks/track-card';
import type { UserCardData } from '@/features/social/components/UserCard';
import type { SearchTab } from '@/features/search/SearchSidebar';
import type { SearchParams } from '@/services/api/discoveryService';

export const SEARCH_PAGE_SIZE = 10;

export type SearchUiTab = SearchTab;
export type SearchApiType = NonNullable<SearchParams['type']>;

export type SearchResultKind = 'track' | 'playlist' | 'user';

export interface EverythingOrderItem {
  kind: SearchResultKind;
  id: string;
}

export interface SearchBuckets {
  tracks: TrackCardProps[];
  playlists: PlaylistHorizontalProps[];
  people: UserCardData[];
}

export interface SearchTotals {
  totalTracks: number;
  totalPlaylists: number;
  totalPeople: number;
}

export interface SearchPagingState {
  page: number;
  size: number;
  hasMore: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  isPaginating: boolean;
}

export interface SearchRequestContext {
  query: string;
  tab: SearchUiTab;
  page: number;
  size: number;
  genre?: string;
  signal?: AbortSignal;
}

export interface SearchPageViewModel extends SearchBuckets, SearchTotals {
  query: string;
  tab: SearchUiTab;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  isPaginating: boolean;
  everythingOrder: EverythingOrderItem[];
  errorMessage: string | null;
}

export interface SearchFetchResult {
  buckets: SearchBuckets;
  totals: Partial<SearchTotals>;
  pageNumber: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
  everythingOrder: EverythingOrderItem[];
}

export interface UseSearchPageDataResult extends SearchPageViewModel {
  loadNextPage: () => void;
  retry: () => void;
  sentinelRef: (node: HTMLDivElement | null) => void;
}

export const SEARCH_TAB_TO_API_TYPE: Record<SearchUiTab, SearchApiType> = {
  everything: 'ALL',
  tracks: 'TRACKS',
  people: 'USERS',
  playlists: 'PLAYLISTS',
};

export const EMPTY_SEARCH_BUCKETS = (): SearchBuckets => ({
  tracks: [],
  playlists: [],
  people: [],
});

export const EMPTY_SEARCH_TOTALS: SearchTotals = {
  totalTracks: 0,
  totalPlaylists: 0,
  totalPeople: 0,
};

export function mapTabToApiType(tab: SearchUiTab): SearchApiType {
  return SEARCH_TAB_TO_API_TYPE[tab];
}
