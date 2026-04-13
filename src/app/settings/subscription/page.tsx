'use client';

import { SubscriptionActions } from '@/features/pro/components/SubscriptionActions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubscriptionData {
  tier: 'free' | 'artist' | 'pro';
  currency: string;
  yearlyPrice: number;
  renewsAt: string | number | Date;
  cardBrand: string;
  cardLast4: string;
}

interface SubscriptionPageProps {
  subscription?: SubscriptionData | null;
  isLoading?: boolean;
  onCancel?: () => void;
  onRenew?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SettingsRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border-default last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`section-${title.toLowerCase()}`} className="mb-8">
      <h2
        id={`section-${title.toLowerCase()}`}
        className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3"
      >
        {title}
      </h2>
      <div className="rounded-xl border border-border-default bg-bg-base px-5 divide-y divide-border-default">
        {children}
      </div>
    </section>
  );
}

// ─── Plan badge ───────────────────────────────────────────────────────────────

const PLAN_BADGE: Record<string, { label: string; className: string }> = {
  pro:    { label: 'Artist Pro ★', className: 'bg-amber-50 text-amber-700 border border-amber-300' },
  artist: { label: 'Artist',       className: 'bg-violet-50 text-violet-700 border border-violet-300' },
  free:   { label: 'Free',         className: 'bg-bg-subtle text-text-secondary border border-border-default' },
};

// ─── Stateless Page ───────────────────────────────────────────────────────────

export default function Page({ 
  subscription, 
  isLoading = false, 
  onCancel, 
  onRenew 
}: SubscriptionPageProps) {
  
  const badge = PLAN_BADGE[subscription?.tier ?? 'pro'] || PLAN_BADGE['free'];

  return (
    <div className="max-w-2xl py-8 px-4">
      <SettingsSection title="Subscription">
        <SettingsRow
          label="Current plan"
          value={
            <span className={`rounded-sm px-2 py-0.5 text-xs font-extrabold tracking-wide ${badge.className}`}>
              {badge.label}
            </span>
          }
        />

        {subscription && (
          <>
            <SettingsRow
              label="Billing cycle"
              value={`Yearly — ${subscription.currency} ${subscription.yearlyPrice.toFixed(2)} / yr`}
            />
            <SettingsRow
              label="Next renewal"
              value={new Date(subscription.renewsAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            />
            <SettingsRow
              label="Payment method"
              value={`${subscription.cardBrand} •••• ${subscription.cardLast4}`}
            />
          </>
        )}

        <div className="py-4">
          <SubscriptionActions
            onCancel={onCancel || (() => {})}
            onRenew={onRenew || (() => {})}
            isLoading={isLoading}
          />
        </div>
      </SettingsSection>
    </div>
    
  );
}