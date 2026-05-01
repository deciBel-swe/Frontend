'use client';

import SearchResults from '@/features/search/SearchResults';
import { useSearchPageData } from '@/features/search/hooks/useSearchPageData';
import type { SearchUiTab } from '@/features/search/types/searchContracts';
import { useAuth } from '@/features/auth';

interface SearchPageContainerProps {
  tabOverride?: SearchUiTab;
}

function AppendLoader() {
  return (
    <div
      className="mt-3 space-y-3"
      aria-live="polite"
      aria-label="Loading more results"
    >
      <div className="h-28 rounded-lg bg-surface-default animate-pulse" />
      <div className="h-28 rounded-lg bg-surface-default animate-pulse" />
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mb-4 rounded-md border border-border-default bg-surface-default px-4 py-3">
      <p className="text-sm text-text-primary">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded bg-interactive-default px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-interactive-hover"
      >
        Retry
      </button>
    </div>
  );
}

export default function SearchPageContainer({
  tabOverride,
}: SearchPageContainerProps) {
  const { user } = useAuth();
  const {
    query,
    tab,
    tracks,
    playlists,
    people,
    totalTracks,
    totalPlaylists,
    totalPeople,
    isInitialLoading,
    isPaginating,
    hasMore,
    everythingOrder,
    errorMessage,
    retry,
    sentinelRef,
  } = useSearchPageData(tabOverride);

  return (
    <div className="w-full">
      {errorMessage ? (
        <ErrorState message={errorMessage} onRetry={retry} />
      ) : null}

      <SearchResults
        tab={tab}
        query={query}
        currentUserId={user?.id != null ? String(user.id) : undefined}
        tracks={tracks}
        playlists={playlists}
        people={people}
        totalTracks={totalTracks}
        totalPlaylists={totalPlaylists}
        totalPeople={totalPeople}
        isLoading={isInitialLoading}
        everythingOrder={everythingOrder}
      />

      {isPaginating ? <AppendLoader /> : null}

      {hasMore ? (
        <div ref={sentinelRef} className="h-3 w-full" aria-hidden />
      ) : null}
    </div>
  );
}
