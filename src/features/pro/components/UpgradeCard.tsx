'use client';

/**
 * UpgradeCard
 *
 * Presentational card that renders a single subscription plan.
 * Completely stateless — all data is passed via props.
 *
 * Rendered by {@link Upgrade} which maps over the {@link PLANS} array.
 *
 * @example
 * <UpgradeCard plan={PLANS[0]} onSelect={(id) => handleSelect(id)} />
 */

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import type { Plan } from '@/features/pro/types';
import { Button } from '@/components/buttons/Button';
import { FeatureIcon } from './FeatureIcon';
import { FeatureBadge } from './FeatureBadge';
import { PlanTierIcon } from '@/features/pro/components/PlanTierIcon';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UpgradeCardProps {
  plan: Plan;
  /** Called when the user clicks the plan CTA */
  onSelect: (planId: string) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const priceColour: Record<Plan['tier'], string> = {
  artist: 'text-violet-600',
  pro: 'text-amber-600',
  free: 'text-violet-600',
  none: 'text-violet-600',
};

const cardBorder: Record<Plan['tier'], string> = {
  artist: 'border border-violet-200',
  pro: 'border-2 border-amber-400',
  free: 'border border-violet-200',
  none: 'border border-violet-200',
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const UpgradeCard: FC<UpgradeCardProps> = ({ plan, onSelect }) => {
  const router = useRouter();
  const {
    id,
    name,
    tier,
    tagline,
    monthlyPrice,
    yearlyPrice,
    currency,
    ctaLabel,
    features,
    isMostPopular,
    seeAllBenefitsHref,
  } = plan;

  const handleCtaClick = () => {
    onSelect(id);
    router.push(ROUTES.SUBSCRIPTION);
  };

  return (
    <article
      className={`relative flex flex-col rounded-xl p-6 bg-bg-base ${cardBorder[tier]}`}
      aria-label={`${name} plan`}
    >
      {/* ── Most popular ribbon ───────────────────────────────────── */}
      {isMostPopular && (
        <div
          className="absolute -top-px right-6 bg-amber-500 text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-b-md"
          aria-label="Most popular plan"
        >
          MOST POPULAR
        </div>
      )}

      {/* ── Plan name ─────────────────────────────────────────────── */}
      <header className="flex items-center mb-3">
        <h3 className="text-2xl font-extrabold text-text-primary leading-none">
          {name}
        </h3>
        <PlanTierIcon tier={tier} />
      </header>

      {/* ── Tagline ───────────────────────────────────────────────── */}
      <p className="text-sm text-text-secondary mb-4 leading-snug">{tagline}</p>

      {/* ── Price ─────────────────────────────────────────────────── */}
      <div className="mb-5">
        <span className={`text-3xl font-extrabold ${priceColour[tier]}`}>
          {currency} {monthlyPrice.toFixed(2)}
        </span>
        <span className="text-xs text-text-muted ml-1.5">
          / month, billed yearly for {currency} {yearlyPrice.toFixed(2)}
        </span>
      </div>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <Button
        variant="secondary"
        size="md"
        fullWidth
        className="rounded-full mb-6"
        onClick={handleCtaClick}
      >
        {ctaLabel}
      </Button>

      {/* ── Features ──────────────────────────────────────────────── */}
      <ul className="flex flex-col gap-3.5" role="list">
        {features.map((feature) => (
          <li
            key={feature.label}
            className="flex items-center gap-3 text-sm text-text-primary"
          >
            <FeatureIcon icon={feature.icon} />
            <span className="flex-1">{feature.label}</span>
            {feature.badge && (
              <FeatureBadge
                text={feature.badge.text}
                variant={feature.badge.variant}
              />
            )}
          </li>
        ))}
      </ul>

      {/* ── See all benefits ──────────────────────────────────────── */}
      {seeAllBenefitsHref && (
        <a
          href={seeAllBenefitsHref}
          className="mt-5 text-sm text-brand font-semibold text-center hover:underline"
        >
          See all benefits
        </a>
      )}
    </article>
  );
};

export default UpgradeCard;
