# Search Discovery Integration Guide

## Purpose

This document defines exactly how to integrate `DiscoveryService.search(...)` into the existing search UI.

It is a specification and implementation handoff. It intentionally does not include production code.

## Scope

In scope:

- Wire backend search into the search pages under `/search*`.
- Keep `SearchResults` stateless and unchanged in behavior.
- Implement tab-aware API querying.
- Implement infinite scroll pagination (`size = 10`, `page` starts at `0`).
- Transform backend DTOs to existing UI prop contracts.

Out of scope:

- Visual redesign of search cards.
- Filter backend support beyond passing optional `genre`.
- Refactoring player behavior not required by search integration.

## Existing Baseline (Must Be Preserved)

Current files and constraints:

- `src/features/search/SearchResults.tsx` is presentational and receives final arrays/counts.
- `src/features/search/SearchSidebar.tsx` controls tab/filter URL state through `useSearchNavigation`.
- `src/app/(search)/search/page.tsx`, `src/app/(search)/search/sounds/page.tsx`, `src/app/(search)/search/people/page.tsx`, `src/app/(search)/search/sets/page.tsx` currently use mock data.
- `src/services/api/discoveryService.ts` already exposes:
  - `search(params: { q, type, page, size, genre? })`
- `src/services/index.ts` already exports `discoveryService` (mock/real switch handled centrally).

Hard constraints:

- Do not move fetching into `SearchResults`.
- Do not split "everything" into multiple API calls.
- Do not overwrite existing results when loading the next page.

## Target Architecture

### Container Pattern

Create one shared search container used by each route page. The container:

- Reads URL-driven query/tab state.
- Calls `discoveryService.search`.
- Owns pagination and merging.
- Passes final props to `SearchResults`.

Recommended placement:

- `src/features/search/containers/SearchPageContainer.tsx`
- `src/features/search/hooks/useSearchPageData.ts`
- `src/features/search/mappers/searchResultMappers.ts`
- `src/features/search/types/searchContracts.ts`

Route pages then become thin wrappers that pass tab intent and render the same container.

### Data Flow

1. Read `query`, `currentTab`, and optional filters from `useSearchNavigation`.
2. Debounce query before fetching.
3. On tab/query change:
   - reset arrays
   - reset `page = 0`
   - reset `hasMore = true`
4. Fetch page 0 with `size = 10`.
5. Transform and store response.
6. Observe sentinel at list bottom; when visible and `hasMore`, fetch next page and append.

## Interfaces and Function Definitions

Define these contracts before implementation.

### 1) Tab and API Type Contracts

```ts
import type { SearchParams } from '@/services/api/discoveryService';

export type SearchUiTab = 'everything' | 'tracks' | 'people' | 'playlists';

export type SearchApiType = NonNullable<SearchParams['type']>;

export type SearchTabToApiMap = Record<SearchUiTab, SearchApiType>;

export const SEARCH_TAB_TO_API_TYPE: SearchTabToApiMap;

export function mapTabToApiType(tab: SearchUiTab): SearchApiType;
```

Expected mapping:

- `everything -> ALL`
- `tracks -> TRACKS`
- `people -> USERS`
- `playlists -> PLAYLISTS`

### 2) Search View State Contracts

```ts
import type { TrackCardProps } from '@/components/tracks/track-card';
import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import type { UserCardData } from '@/features/social/components/UserCard';

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
  isLoading: boolean;
  isInitialLoading: boolean;
  isPaginating: boolean;
  hasMore: boolean;
  errorMessage: string | null;
}
```

### 3) Fetch and Merge Function Contracts

```ts
import type { PaginatedSearchResponseDTO, ResourceRefFullDTO } from '@/types/discovery';

export interface SearchFetchResult {
  buckets: SearchBuckets;
  totals: Partial<SearchTotals>;
  pageNumber: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
}

export function buildSearchParams(input: SearchRequestContext): SearchParams;

export function fetchSearchPage(input: SearchRequestContext): Promise<SearchFetchResult>;

export function transformSearchResponse(
  response: PaginatedSearchResponseDTO,
  tab: SearchUiTab
): SearchFetchResult;

export function mergeSearchBuckets(
  previous: SearchBuckets,
  incoming: SearchBuckets
): SearchBuckets;

export function deriveHasMore(meta: {
  isLast: boolean;
  pageNumber: number;
  totalPages: number;
}): boolean;
```

### 4) DTO to UI Mapper Contracts

```ts
import type { ResourceRefFullDTO } from '@/types/discovery';

export function mapTrackResourceToTrackCard(
  resource: ResourceRefFullDTO
): TrackCardProps | null;

export function mapPlaylistResourceToPlaylistCard(
  resource: ResourceRefFullDTO
): PlaylistHorizontalProps | null;

export function mapUserResourceToUserCard(
  resource: ResourceRefFullDTO
): UserCardData | null;

export function partitionResourcesByType(resources: ResourceRefFullDTO[]): {
  trackResources: ResourceRefFullDTO[];
  playlistResources: ResourceRefFullDTO[];
  userResources: ResourceRefFullDTO[];
};
```

### 5) Infinite Scroll Contracts

```ts
export interface InfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScrollSentinel(
  options: InfiniteScrollOptions
): { sentinelRef: (node: HTMLDivElement | null) => void };
```

### 6) Hook Contract for Container Consumption

```ts
export interface UseSearchPageDataResult extends SearchPageViewModel {
  loadNextPage: () => void;
  retry: () => void;
  sentinelRef: (node: HTMLDivElement | null) => void;
}

export function useSearchPageData(tabOverride?: SearchUiTab): UseSearchPageDataResult;
```

## Mapping Rules (DTO -> UI Props)

### Track Mapping Rules

Map `resource.track` to `TrackCardProps` using stable identities:

- `trackId = String(track.id)`
- `track.id = track.id`
- `track.title = track.title`
- `track.artist = track.artist.displayName || track.artist.username`
- `track.cover = track.coverUrl`
- `track.duration = formatDuration(track.trackDurationSeconds)`, fallback `'0:00'`
- `track.plays = track.playCount`
- `track.comments = track.commentCount`
- `track.genre = track.genre`
- `track.isLiked = track.isLiked`
- `track.isReposted = track.isReposted`
- `track.likeCount = track.likeCount`
- `track.repostCount = track.repostCount`
- `user.username = track.artist.username`
- `user.displayName = track.artist.displayName`
- `user.avatar = track.artist.avatarUrl`
- `waveform = []` when no waveform samples are available

### Playlist Mapping Rules

Map `resource.playlist` to `PlaylistHorizontalProps`:

- `trackId = String(playlist.id)`
- Reuse playlist metadata in `track` fields expected by card:
  - `track.id = playlist.id`
  - `track.title = playlist.title`
  - `track.artist = playlist.owner.displayName || playlist.owner.username`
  - `track.cover = playlist.coverArtUrl`
  - `track.duration = formatDuration(playlist.totalDurationSeconds)` fallback `'0:00'`
  - counters default to `0` where not provided
- `user` comes from playlist owner
- `relatedTracks` from first N playlist tracks (optional, may be empty)
- `waveform = []`

### User Mapping Rules

Map `resource.user` to `UserCardData`:

- `id = String(user.id)`
- `username = user.username`
- `displayName = user.displayName || undefined`
- `avatarSrc = user.avatarUrl || undefined`
- `followerCount = user.followerCount`
- `isFollowing = user.isFollowing`

### Type-Specific Population Rules

- `everything`: populate all three arrays from a single response.
- `tracks`: populate only tracks; playlists/people remain unchanged as empty in current context.
- `playlists`: populate only playlists.
- `people`: populate only people.

## Fetch Behavior Requirements

### Tab to API Type

- `everything -> type: 'ALL'`
- `tracks -> type: 'TRACKS'`
- `people -> type: 'USERS'`
- `playlists -> type: 'PLAYLISTS'`

### One Call for Everything

When tab is `everything`:

- perform exactly one `search()` request
- pass `type: 'ALL'`
- partition mixed content locally

### Pagination

- fixed page size: `size = 10`
- initial request: `page = 0`
- next request: increment page by 1
- append deduplicated results
- stop when `isLast === true` (and/or `pageNumber >= totalPages - 1`)

## Request Safety and De-duplication

Must implement all of the following:

1. Query debounce using existing `useDebounce` hook.
2. Abort stale in-flight request when query/tab changes.
3. Ignore late responses from cancelled/obsolete requests.
4. Prevent duplicate fetches for the same `{query, tab, page, size, genre}` key.

Suggested helper signatures:

```ts
export function createSearchRequestKey(input: {
  query: string;
  tab: SearchUiTab;
  page: number;
  size: number;
  genre?: string;
}): string;

export function shouldFetchNextPage(input: {
  hasMore: boolean;
  isLoading: boolean;
  query: string;
}): boolean;
```

## UX Rules

1. Initial load skeleton:
   - pass `isLoading = true` to `SearchResults` only for first page load.
2. Pagination loader:
   - render a bottom append loader outside `SearchResults` while loading page > 0.
3. Empty state:
   - rely on existing empty handling in `SearchResults` when all arrays are empty.
4. Preserve scroll position:
   - append items in place; do not replace previous pages.

## Stable Identity and Keys

`SearchResults` currently keys some list rows by index. Since this task must not alter `SearchResults` logic, enforce stable ordering and deduplication before passing props:

- dedupe each bucket by entity id
- keep deterministic order by arrival/page sequence
- avoid re-sorting existing pages during append

If key-level improvements are required later, handle in a separate ticket that modifies `SearchResults`.

## Container Responsibilities

Container must own:

- `tracks`, `playlists`, `people`
- `totalTracks`, `totalPlaylists`, `totalPeople`
- `page`
- `isLoading`
- `hasMore`

State reset triggers:

- debounced query changes
- effective tab changes

## Page Integration Plan

Update each page under `src/app/(search)/search/*` to render the shared container instead of mock data.

Expected wrappers:

- `/search` -> tab override `everything`
- `/search/sounds` -> tab override `tracks`
- `/search/people` -> tab override `people`
- `/search/sets` -> tab override `playlists`

Also remove/retire `src/features/search/mock/mockdata.ts` usage from these pages.

## Testing Requirements

Add tests for:

1. Tab mapping:
   - each tab maps to expected API type.
2. Everything behavior:
   - one API call only with `type='ALL'`.
3. Tab-specific behavior:
   - each tab populates only its relevant bucket.
4. Pagination append:
   - page 1 appends to page 0, does not replace.
5. Stop condition:
   - no extra fetch after `isLast=true`.
6. Reset behavior:
   - query change resets arrays/page/hasMore.
   - tab change resets arrays/page/hasMore.
7. De-duplication:
   - duplicate resources across pages are merged once.
8. Debounce and duplicate request prevention:
   - repeated rapid inputs do not trigger redundant requests.

Recommended test locations:

- `src/tests/unit/features/search/` for hook/mapper tests
- `src/tests/unit/app/search/` for page-container behavior tests

## Acceptance Checklist

Use this checklist as Definition of Done:

- [ ] Search pages use real `discoveryService.search` data.
- [ ] Tab -> API type mapping matches product requirement.
- [ ] `everything` uses one request with `type='ALL'`.
- [ ] Infinite scroll loads 10 results per page.
- [ ] New pages append without replacing prior results.
- [ ] Loading, append loading, and empty states behave correctly.
- [ ] State resets correctly on query/tab changes.
- [ ] No duplicate in-flight requests for same request key.
- [ ] `SearchResults` remains stateless and fetch-free.
- [ ] Unit tests cover mapping, pagination, and reset logic.

## Notes for Implementer

- Reuse `formatDuration` from `src/utils/formatDuration.ts`.
- Keep all search fetch logic in container/hook, never in presentation cards.
- Prefer pure mapper functions for deterministic tests.
- If backend later adds per-type totals for mixed search, update `SearchTotals` derivation without changing container API.