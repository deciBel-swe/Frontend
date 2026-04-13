'use client';

import React, { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselProps = {
  children: React.ReactNode;
  /**
   * Number of pixels to scroll per button click.
   * Defaults to 320 — roughly 2 card widths at the base size.
   */
  scrollStep?: number;
};

/**
 * DiscoverCarousel
 *
 * manages horizontal pagination via left/right buttons.
 * only handles the scroll container.
 */
export default function Carousel({ children, scrollStep = 320 }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const syncArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const scrollLeft = useCallback(() => {
    trackRef.current?.scrollBy({ left: -scrollStep, behavior: 'smooth' });
  }, [scrollStep]);

  const scrollRight = useCallback(() => {
    trackRef.current?.scrollBy({ left: scrollStep, behavior: 'smooth' });
  }, [scrollStep]);

  return (
    <div className="relative group/carousel">
      {/* ── Left arrow ── */}
      <button
        aria-label="Scroll left"
        onClick={scrollLeft}
        className={[
          'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10',
          'h-9 w-9 rounded-full',
          'bg-surface-default',
          'flex items-center justify-center',
          'shadow-md transition-all duration-200',
          'hover:bg-surface-hover hover:border-border-default',
          canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <ChevronLeft size={18} className="text-text-primary" />
      </button>

      {/* ── Scrollable track ── */}
      <div
        ref={trackRef}
        style={{ overflowX: "hidden", touchAction: "none" }}
        onScroll={syncArrows}
        className="flex flex-row overflow-x-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {children}
      </div>

      {/* ── Right arrow ── */}
      <button
        aria-label="Scroll right"
        onClick={scrollRight}
        className={[
          'absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10',
          'h-9 w-9 rounded-full',
          'bg-surface-default',
          'flex items-center justify-center',
          'shadow-md transition-all duration-200',
          'hover:bg-surface-hover hover:border-border-default',
          canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <ChevronRight size={18} className="text-text-primary" />
      </button>
    </div>
  );
}