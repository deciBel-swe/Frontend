'use client';

/**
 * Upgrade
 *
 * The full upgrade UI — header copy, plan cards grid, and a "continue without
 * a paid plan" escape hatch. Purely presentational; all behaviour is lifted
 * to the parent (typically {@link UpgradeModal}).
 *
 * @example
 * <Upgrade onSelectPlan={handleSelect} onSkip={closeModal} />
 */

import type { FC } from 'react';
import { UpgradeCard } from './UpgradeCard';
import { PLANS } from '@/features/pro/constants/plans';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpgradeProps {
  /** Called when the user clicks a plan CTA */
  onSelectPlan: (planId: string) => void;
  /** Called when the user clicks "continue without a paid plan" */
  onSkip: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Upgrade: FC<UpgradeProps> = ({ onSelectPlan, onSkip }) => (
  <section aria-labelledby="upgrade-heading" className="flex flex-col items-center">
    {/* ── Header ──────────────────────────────────────────────────── */}
    <header className="text-center mb-8 px-4">
      <h2
        id="upgrade-heading"
        className="text-3xl font-extrabold text-text-primary leading-tight"
      >
        Unlock artist tools and reach more listeners
      </h2>
      <p className="mt-2 text-sm text-text-secondary">
        Select the plan that suits you best
      </p>
    </header>

    {/* ── Plan cards ──────────────────────────────────────────────── */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
      {PLANS.map((plan) => (
        <UpgradeCard key={plan.id} plan={plan} onSelect={onSelectPlan} />
      ))}
    </div>

    {/* ── Skip CTA ────────────────────────────────────────────────── */}
    <button
      type="button"
      onClick={onSkip}
      className="mt-8 flex items-center gap-2 px-5 py-2.5 rounded-full border border-border-default text-sm font-semibold text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors duration-150"
    >
      Or continue without a paid plan
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  </section>
);

export default Upgrade;