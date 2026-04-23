'use client';

import type { ReactNode } from 'react';

type InfiniteScrollPaginationProps = {
  hasMore?: boolean;
  isPaginating?: boolean;
  sentinelRef?: (node: HTMLDivElement | null) => void;
  loader?: ReactNode;
  className?: string;
};

export default function InfiniteScrollPagination({
  hasMore = false,
  isPaginating = false,
  sentinelRef,
  loader,
  className = '',
}: InfiniteScrollPaginationProps) {
  if (!hasMore && !isPaginating) {
    return null;
  }

  return (
    <div className={className}>
      {isPaginating ? (
        loader ?? (
          <div className="py-4 text-center text-sm text-text-muted">
            Loading more...
          </div>
        )
      ) : null}

      {hasMore && sentinelRef ? (
        <div ref={sentinelRef} className="h-3 w-full" aria-hidden />
      ) : null}
    </div>
  );
}
