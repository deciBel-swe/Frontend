import React from 'react';
import DiscoverHeader from '@/features/discover/DiscoverHeader';
import Carousel from '@/components/nav/Carousel';
import EmptyState from '../social/EmptyState';
import { SquareSkeleton } from '../library/LibraryOverview';

type DiscoverSectionProps<T> = {
  title: string;
  items: T[];
  /** Render a single card given an item and its index */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Optional "See all" link rendered in the header */
  actionLabel?: string;
  actionHref?: string;
  /** Pixels to advance per carousel button click (forwarded to DiscoverCarousel) */
  scrollStep?: number;
  /**
   * When true, render a skeleton row instead of real content.
   * TODO: wire up to loading state from data-fetching hook.
   */
  isLoading?: boolean;
  /** Number of skeleton placeholders to show while loading */
  skeletonCount?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  canPrevPage?: boolean;
  canNextPage?: boolean;
};

/**
 * DiscoverSection
 *
 * composes a header + carousel into one named section.
 * Generic over item type T → new card shapes never require changes here.
 * Depends on abstractions (renderItem prop) not concrete card implementations.
 *
 * TODO: pass isLoading={true} once the data hook is connected.
 */
export default function DiscoverSection<T>({
  title,
  items,
  renderItem,
  actionLabel,
  actionHref,
  scrollStep,
  isLoading = false,
  skeletonCount = 6,
  onPrevPage,
  onNextPage,
  canPrevPage = true,
  canNextPage = true,
}: DiscoverSectionProps<T>) {
  return (
    <section className="mb-10">
      <DiscoverHeader
        title={title}
        actionLabel={actionLabel}
        actionHref={actionHref}
      />

      {isLoading ? (
        /* ── Skeleton state ──────────────────────────────────────────────── */
        <div className="flex gap-0 overflow-hidden">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <SquareSkeleton key={`likes-skeleton-${i}`} />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────────── */
         <EmptyState
          title="Nothing here yet"
          description="Check back soon for new tracks."
        />
      ) : (
        /* ── Carousel ────────────────────────────────────────────────────── */
        <Carousel
          scrollStep={scrollStep}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
          canPrevPage={canPrevPage}
          canNextPage={canNextPage}
        >
          {items.map((item, index) => renderItem(item, index))}
        </Carousel>
      )}
    </section>
  );
}