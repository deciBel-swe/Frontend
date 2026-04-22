'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselProps = {
  children: React.ReactNode;
  /**
   * Number of pixels to scroll per button click.
   * Defaults to 320 - roughly 2 card widths at the base size.
   */
  scrollStep?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  canPrevPage?: boolean;
  canNextPage?: boolean;
};

/**
 * DiscoverCarousel
 *
 * manages horizontal pagination via left/right buttons.
 * only handles the scroll container.
 */
export default function Carousel({
  children,
  scrollStep = 320,
  onPrevPage,
  onNextPage,
  canPrevPage = true,
  canNextPage = true,
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const canUsePrev = onPrevPage ? canPrevPage : canScrollLeft;
  const canUseNext = onNextPage ? canNextPage : canScrollRight;

  const syncArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) {
      return;
    }

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    syncArrows();
  }, [children, syncArrows]);

  const scrollLeft = useCallback(() => {
    if (onPrevPage) {
      if (!canPrevPage) {
        return;
      }

      onPrevPage();
      return;
    }

    if (!canScrollLeft) {
      return;
    }

    trackRef.current?.scrollBy({ left: -scrollStep, behavior: 'smooth' });
  }, [canPrevPage, canScrollLeft, onPrevPage, scrollStep]);

  const scrollRight = useCallback(() => {
    if (onNextPage) {
      if (!canNextPage) {
        return;
      }

      onNextPage();
      return;
    }

    if (!canScrollRight) {
      return;
    }

    trackRef.current?.scrollBy({ left: scrollStep, behavior: 'smooth' });
  }, [canNextPage, canScrollRight, onNextPage, scrollStep]);

  return (
    <div className="relative group/carousel">
      <button
        type="button"
        aria-label="Scroll left"
        disabled={!canUsePrev}
        onClick={scrollLeft}
        className={[
          'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10',
          'h-9 w-9 rounded-full',
          'bg-surface-default',
          'flex items-center justify-center',
          'shadow-md transition-all duration-200',
          'hover:bg-surface-hover hover:border-border-default',
          canUsePrev
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <ChevronLeft size={18} className="text-text-primary" />
      </button>

      <div
        ref={trackRef}
        style={{ overflowX: 'hidden', touchAction: 'none' }}
        onScroll={syncArrows}
        className="flex flex-row overflow-x-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll right"
        disabled={!canUseNext}
        onClick={scrollRight}
        className={[
          'absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10',
          'h-9 w-9 rounded-full',
          'bg-surface-default',
          'flex items-center justify-center',
          'shadow-md transition-all duration-200',
          'hover:bg-surface-hover hover:border-border-default',
          canUseNext
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <ChevronRight size={18} className="text-text-primary" />
      </button>
    </div>
  );
}
