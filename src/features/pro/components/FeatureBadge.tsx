'use client';

/**
 * FeatureBadge
 *
 * Small pill badge rendered next to a plan feature label.
 * Uses variant-specific Tailwind classes to distinguish Artist (purple)
 * from Artist Pro (gold) badges.
 *
 * @example
 * <FeatureBadge text="2X MONTH" variant="artist" />
 * <FeatureBadge text="UNLIMITED" variant="pro" />
 */

import type { FC } from 'react';
import type { FeatureBadge as FeatureBadgeType } from '@/features/pro/types';

const variantClasses: Record<FeatureBadgeType['variant'], string> = {
  pro: 'bg-amber-50   text-amber-700 border border-amber-300',
  free: 'bg-brand-subtle text-brand border border-brand/30',
};

export const FeatureBadge: FC<FeatureBadgeType> = ({ text, variant }) => (
  <span
    className={`ml-auto shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide ${variantClasses[variant]}`}
  >
    {text}
  </span>
);

export default FeatureBadge;
