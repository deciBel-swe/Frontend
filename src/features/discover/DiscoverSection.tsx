import React from 'react';
import DiscoverHeader from '@/features/discover/DiscoverHeader';
import Carousel from '@/components/nav/Carousel';

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
            <div
              key={i}
              className="
                shrink-0
                w-26 h-26
                md:w-32 md:h-32
                lg:w-40 lg:h-40
                rounded-md
                m-2
                bg-surface-default
                animate-pulse
              "
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <p className="text-sm text-text-muted py-4">
          Nothing here yet — check back soon.
        </p>
      ) : (
        /* ── Carousel ────────────────────────────────────────────────────── */
        <Carousel scrollStep={scrollStep}>
          {items.map((item, index) => renderItem(item, index))}
        </Carousel>
      )}
    </section>
  );
}