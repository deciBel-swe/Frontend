'use client';

import { SubscriptionActions } from '@/features/pro/components/SubscriptionActions';

// ─── Mock data ────────────────────────────────────────
const mockSubscription = {
  tier: 'pro',              // change to 'artist' or 'free' to see different badges
  currency: 'USD',
  yearlyPrice: 99.99,
  renewsAt: '2026-01-15T00:00:00Z',
  cardBrand: 'Visa',
  cardLast4: '4242',
};

// ─── Helper components (same as yours) ────────────────────────────────────────
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
    <section className="mb-8">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
        {title}
      </h2>
      <div className="rounded-xl border border-border-default bg-bg-base px-5 divide-y divide-border-default">
        {children}
      </div>
    </section>
  );
}

const PLAN_BADGE: Record<string, { label: string; className: string }> = {
  pro:    { label: 'Artist Pro ★', className: 'bg-amber-50 text-amber-700 border border-amber-300' },
  artist: { label: 'Artist',       className: 'bg-violet-50 text-violet-700 border border-violet-300' },
  free:   { label: 'Free',         className: 'bg-bg-subtle text-text-secondary border border-border-default' },
};

export default function SubscriptionPage() {
  const subscription = mockSubscription; 
  const badge = PLAN_BADGE[subscription.tier];

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

          {/* In a real app, you would conditionally render these rows based on the subscription status.}
          
        {/* Only show billing details if subscription is paid (artist or pro) */}
        {subscription && subscription.tier !== 'free' && (
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
            <div className="py-4">
              <SubscriptionActions
                onCancel={() => console.log('Cancel clicked')}
                onRenew={() => console.log('Renew clicked')}
                isLoading={false}
              />
            </div>
          </>
          
        )}

        {/* For free tier or no subscription, show a simple status message instead */}
        {subscription && subscription.tier === 'free' && (
          <SettingsRow
            label="Status"
            value="No active paid plan – upgrade to unlock features"
          />
        )}

      </SettingsSection>
    </div>
  );
}