'use client';

import FloatingInputField from '@/features/auth/components/FormFields/FloatingInputField';
import PasswordInput from '@/components/FormFields/auth/PasswordInput';

import { ADMIN_LOGIN_COPY } from './constants';
import { useAdminLogin } from './useAdminLogin';

const SecurityPanel = () => {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border-default bg-surface-raised p-8 text-text-primary shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand-primary" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-brand-primary)_12%,transparent),transparent_30%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--color-status-info)_12%,transparent),transparent_32%)]" />
      <div className="relative space-y-8">
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full border border-border-brand/30 bg-brand-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-primary">
            {ADMIN_LOGIN_COPY.eyebrow}
          </span>
          <div className="space-y-3">
            <h1 className="max-w-md text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              {ADMIN_LOGIN_COPY.title}
            </h1>
            <p className="max-w-lg text-sm leading-6 text-text-muted sm:text-base">
              {ADMIN_LOGIN_COPY.subtitle}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {ADMIN_LOGIN_COPY.securityPoints.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-border-default bg-surface-default px-4 py-4"
            >
              <p className="text-sm leading-6 text-text-secondary">{point}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border-default bg-bg-base px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
            {ADMIN_LOGIN_COPY.supportLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {ADMIN_LOGIN_COPY.supportText}
          </p>
        </div>
      </div>
    </section>
  );
};

const AdminLoginFormCard = () => {
  const {
    formValues,
    fieldErrors,
    submitError,
    isSubmitting,
    updateField,
    handleSubmit,
  } = useAdminLogin();

  return (
    <section className="rounded-[32px] border border-border-default bg-surface-default p-6 shadow-[0_32px_90px_rgba(15,23,42,0.12)] sm:p-8">
      <div className="mb-8 space-y-3">
        <div className="inline-flex items-center rounded-full border border-border-default bg-bg-subtle px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Restricted access
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            {ADMIN_LOGIN_COPY.formTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            {ADMIN_LOGIN_COPY.formSubtitle}
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FloatingInputField
          type="email"
          name="email"
          autoComplete="email"
          label={ADMIN_LOGIN_COPY.emailLabel}
          value={formValues.email}
          onChange={(value) => updateField('email', value)}
          error={fieldErrors.email}
        />

        <div>
          <PasswordInput
            value={formValues.password}
            onChange={(value) => updateField('password', value)}
            label={ADMIN_LOGIN_COPY.passwordLabel}
          />
          {fieldErrors.password ? (
            <p className="mt-2 text-xs text-status-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {submitError ? (
          <div className="rounded-2xl border border-status-error/25 bg-status-error/10 px-4 py-3 text-sm text-status-error">
            {submitError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-primary px-4 text-sm font-semibold text-text-on-brand transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:bg-interactive-hover disabled:text-text-muted"
        >
          {isSubmitting
            ? ADMIN_LOGIN_COPY.signingInLabel
            : ADMIN_LOGIN_COPY.submitLabel}
        </button>

        <p className="text-xs leading-5 text-text-muted">
          {ADMIN_LOGIN_COPY.helperText}
        </p>
      </form>
    </section>
  );
};

export const AdminLoginScreen = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bg-base px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-brand-primary)_8%,transparent),transparent_24%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--color-status-info)_8%,transparent),transparent_28%)]" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SecurityPanel />
        <AdminLoginFormCard />
      </div>
    </main>
  );
};
