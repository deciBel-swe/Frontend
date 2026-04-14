'use client';

/**
 * PlanTierIcon
 *
 * Renders the decorative tier icon displayed inline with the plan name.
 * Artist → purple circle-plus  |  Artist Pro → gold star circle.
 *
 * @example
 * <PlanTierIcon tier="artist" />
 * <PlanTierIcon tier="pro" />
 */

import type { FC } from 'react';
import type { PlanTier } from '@/features/pro/types';

interface PlanTierIconProps {
  tier: PlanTier;
}

export const PlanTierIcon: FC<PlanTierIconProps> = ({ tier }) => {
  if (tier === 'pro') {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-600 ml-2 shrink-0" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </span>
    );
  }

  return (
     <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-600 text-white ml-2 shrink-0"
      aria-hidden
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
      </svg>
    </span>
  );
};

export default PlanTierIcon;