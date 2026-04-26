'use client';

import { useMemo, useState, type ReactNode } from 'react';

import Button from '@/components/buttons/Button';
import { SubscriptionActions } from '@/features/pro/components/SubscriptionActions';
import { useCancelSubscription } from '@/features/pro/hooks/useCancelSubscription';
import { useCreateCheckoutSession } from '@/features/pro/hooks/useCreateCheckoutSession';
import { useRenewSubscription } from '@/features/pro/hooks/useRenewSubscription';
import { useSubscriptionStatus } from '@/features/pro/hooks/useSubscriptionStatus';

function SettingsRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border-default last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
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
  pro: {
    label: 'Pro',
    className: 'bg-amber-50 text-amber-700 border border-amber-300',
  },
  free: {
    label: 'Free',
    className: 'bg-bg-subtle text-text-secondary border border-border-default',
  },
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  cancelled: 'Cancelled',
  past_due: 'Past due',
  trialing: 'Trialing',
};

const toDateLabel = (epochSeconds: number) =>
  new Date(epochSeconds * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const isKnownPlan = (plan: string) =>
  Object.prototype.hasOwnProperty.call(PLAN_BADGE, plan);

const getBadge = (plan: string) => {
  if (isKnownPlan(plan)) {
    return PLAN_BADGE[plan];
  }

  return {
    label: plan || 'Free',
    className: 'bg-bg-subtle text-text-secondary border border-border-default',
  };
};

export default function SubscriptionPage() {
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    subscriptionStatus,
    fetchSubscriptionStatus,
    isLoading: isSubscriptionLoading,
    isError: hasSubscriptionError,
    error: subscriptionError,
  } = useSubscriptionStatus();

  const {
    cancelSubscription,
    isLoading: isCancelling,
    error: cancelError,
  } = useCancelSubscription();
  const {
    renewSubscription,
    isLoading: isRenewing,
    error: renewError,
  } = useRenewSubscription();
  const {
    createCheckoutSession,
    isLoading: isCreatingCheckout,
    error: checkoutError,
  } = useCreateCheckoutSession();

  const actionLoading = isCancelling || isRenewing || isCreatingCheckout;

  const plan = subscriptionStatus?.plan?.trim().toLowerCase() ?? 'free';
  const isFreePlan = plan === 'free';
  const badge = getBadge(plan);
  const isAutoRenewOff = Boolean(subscriptionStatus?.cancelAtPeriodEnd);

  const latestHookError =
    actionError ??
    cancelError?.message ??
    renewError?.message ??
    checkoutError?.message ??
    null;

  const statusText = useMemo(() => {
    if (!subscriptionStatus?.status) {
      return 'Unknown';
    }

    return STATUS_LABEL[subscriptionStatus.status] ?? subscriptionStatus.status;
  }, [subscriptionStatus?.status]);

  const handleCancel = async () => {
    setActionError(null);

    try {
      const response = await cancelSubscription();
      setActionMessage(response.message);
      await fetchSubscriptionStatus();
    } catch {
      setActionMessage(null);
      setActionError('Unable to cancel subscription. Please try again.');
    }
  };

  const handleRenew = async () => {
    setActionError(null);

    try {
      const response = await renewSubscription();
      setActionMessage(response.message);
      await fetchSubscriptionStatus();
    } catch {
      setActionMessage(null);
      setActionError('Unable to renew subscription. Please try again.');
    }
  };

  const handleUpgrade = async () => {
    setActionError(null);

    try {
      const response = await createCheckoutSession();
      window.location.assign(response.checkoutUrl);
    } catch {
      setActionMessage(null);
      setActionError('Unable to start checkout. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl py-8 px-4">
      <SettingsSection title="Subscription">
        {isSubscriptionLoading && (
          <SettingsRow label="Status" value="Loading subscription..." />
        )}

        {hasSubscriptionError && (
          <div className="py-4 flex items-center justify-between gap-3">
            <span className="text-sm text-status-error">
              {subscriptionError?.message ??
                'Unable to load subscription details.'}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void fetchSubscriptionStatus()}
              disabled={isSubscriptionLoading}
            >
              Retry
            </Button>
          </div>
        )}

        {subscriptionStatus &&
          !isSubscriptionLoading &&
          !hasSubscriptionError && (
            <>
              <SettingsRow
                label="Current plan"
                value={
                  <span
                    className={`rounded-sm px-2 py-0.5 text-xs font-extrabold tracking-wide ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                }
              />

              <SettingsRow label="Subscription status" value={statusText} />

              {!isFreePlan && (
                <>
                  <SettingsRow
                    label="Cancellation"
                    value={
                      subscriptionStatus.cancelAtPeriodEnd
                        ? 'Ends on current period'
                        : 'Auto renew'
                    }
                  />
                  {subscriptionStatus.currentPeriodEnd !== null && (
                    <SettingsRow
                      label="Next renewal"
                      value={toDateLabel(subscriptionStatus.currentPeriodEnd)}
                    />
                  )}
                  <div className="py-4">
                    <SubscriptionActions
                      onCancel={() => {
                        void handleCancel();
                      }}
                      onRenew={() => {
                        void handleRenew();
                      }}
                      showCancelAction={true}
                      showSecondaryAction={isAutoRenewOff}
                      secondaryLabel="Renew subscription"
                      isLoading={actionLoading}
                    />
                  </div>
                </>
              )}

              {isFreePlan && (
                <>
                  <SettingsRow
                    label="Status"
                    value="No active paid plan - upgrade to unlock features"
                  />
                  <div className="py-4">
                    <SubscriptionActions
                      onRenew={() => {
                        void handleUpgrade();
                      }}
                      showCancelAction={false}
                      showSecondaryAction={true}
                      secondaryLabel="Subscribe"
                      isLoading={actionLoading}
                    />
                  </div>
                </>
              )}

              {actionMessage && (
                <div className="py-3 text-sm text-text-secondary">
                  {actionMessage}
                </div>
              )}

              {latestHookError && (
                <div className="py-3 text-sm text-status-error">
                  {latestHookError}
                </div>
              )}
            </>
          )}
      </SettingsSection>
    </div>
  );
}
