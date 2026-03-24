'use client';

import React, { useEffect, useState } from 'react';
import { useRegistrationSubmit } from '@/features/auth/useRegistrationSubmit';
import ContinueButton from '../ContinueButton';
import EmailSentConfirmation from './EmailSentConfirmation';
import PasswordInput from '../FormFields/PasswordInput';
import FloatingSelectField from '../FormFields/FloatingSelectField';
import FloatingInputField from '../FormFields/FloatingInputField';

import {
  type FieldErrors,
  type RegistrationFormValues,
} from '@/types/authSchemas';

/**
 * Pre-configured select options for registration form date of birth fields
 */
const monthOptions = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map((month) => ({ value: month, label: month }));

const dayOptions = Array.from({ length: 31 }, (_, index) => {
  const value = `${index + 1}`;
  return { value, label: value };
});

const yearOptions = Array.from({ length: 100 }, (_, index) => {
  const value = `${new Date().getFullYear() - index}`;
  return { value, label: value };
});

const genderOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

/**
 * RegistrationForm Component
 *
 * A comprehensive user registration form for creating a new DeciBel account.
 * Features:
 * - Email and password validation with confirmation
 * - Display name auto-suggestion based on email (customizable by user)
 * - Date of birth selection with age verification (minimum 13 years)
 * - Gender selection (optional, with prefer-not-to-say option)
 * - Form-level and field-level error handling
 * - reCAPTCHA v3 verification on submission
 * - Email verification confirmation modal after successful submission
 * - Loading state during form submission
 *
 * The form uses:
 * - `useRegistrationSubmit` hook for form submission logic
 * - `registrationSchema` for comprehensive validation
 * - Built-in age verification (must be 13+)
 * - Password strength validation (min 6 chars, 1 uppercase, 1 number)
 *
 * @component
 * @returns {JSX.Element} The registration form
 *
 * @example
 * <ReCaptchaProvider>
 *   <RegistrationForm />
 * </ReCaptchaProvider>
 */
const RegistrationForm: React.FC = () => {
  const [formValues, setFormValues] = useState<RegistrationFormValues>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    month: '',
    day: '',
    year: '',
    gender: '',
  });
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<RegistrationFormValues>
  >({});
  const [displayNameEdited, setDisplayNameEdited] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { handleSubmit } = useRegistrationSubmit({
    formValues,
    setFieldErrors,
    setSubmitError,
    setIsSubmitting,
    onSuccess: () => setShowConfirmation(true),
  });

  useEffect(() => {
    if (displayNameEdited || !formValues.email.includes('@')) {
      return;
    }

    const suggestedName = formValues.email.split('@')[0] || '';
    setFormValues((previous) =>
      previous.displayName === suggestedName
        ? previous
        : { ...previous, displayName: suggestedName }
    );
  }, [displayNameEdited, formValues.email]);

  const updateField = (field: keyof RegistrationFormValues, value: string) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
    setSubmitError('');

    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      return { ...previous, [field]: undefined };
    });
  };

  const dateOfBirthError =
    fieldErrors.month || fieldErrors.day || fieldErrors.year || '';

  return (
    <div className="flex items-center justify-center bg-bg-base">
      <div className="px-4 border-2 border-border-default flex items-center justify-center rounded py-8">
        <div className="w-100 bg-bg-base">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-3">
              <h2
                className="text-3xl font-bold mb-1 text-black dark:text-neutral-0">
                Tell us more about you
              </h2>
            </div>

            <div className="space-y-1">
              <FloatingInputField
                type="email"
                autoComplete="email"
                name="email"
                label="Your email address"
                value={formValues.email}
                onChange={(value) => updateField('email', value)}
                error={fieldErrors.email}
              />
            </div>

            <div className="space-y-1">
              <PasswordInput
                label="Choose a password (min. 6 characters)"
                value={formValues.password}
                onChange={(value) => updateField('password', value)}
              />
              {fieldErrors.password ? (
                <div className="text-red-400 text-xs">
                  {fieldErrors.password}
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <PasswordInput
                label="Confirm password"
                value={formValues.confirmPassword}
                onChange={(value) => updateField('confirmPassword', value)}
              />
              {fieldErrors.confirmPassword ? (
                <div className="text-red-400 text-xs">
                  {fieldErrors.confirmPassword}
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <FloatingInputField
                type="text"
                autoComplete="nickname"
                name="displayName"
                label="Display name"
                value={formValues.displayName}
                onChange={(value) => {
                  setDisplayNameEdited(true);
                  updateField('displayName', value);
                }}
                error={fieldErrors.displayName}
              />
              <div className="text-gray-400 text-xs">
                Your display name can be anything you like. Your name or artist
                name are good choices.
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold select-none">
                Date of birth (required)
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <FloatingSelectField
                    name="month"
                    label="Month"
                    value={formValues.month}
                    onChange={(value) => updateField('month', value)}
                    options={monthOptions}
                    placeholder="Month"
                  />
                </div>
                <div className="w-1/4">
                  <FloatingSelectField
                    name="day"
                    label="Day"
                    value={formValues.day}
                    onChange={(value) => updateField('day', value)}
                    options={dayOptions}
                    placeholder="Day"
                  />
                </div>
                <div className="w-1/4">
                  <FloatingSelectField
                    name="year"
                    label="Year"
                    value={formValues.year}
                    onChange={(value) => updateField('year', value)}
                    options={yearOptions}
                    placeholder="Year"
                  />
                </div>
              </div>
              <div className="text-gray-400 text-xs">
                Your date of birth is used to verify your age and is not shared
                publicly.
              </div>
              {dateOfBirthError ? (
                <div className="text-red-400 text-xs">{dateOfBirthError}</div>
              ) : null}
            </div>

            <div className="space-y-1">
              <FloatingSelectField
                name="gender"
                label="Gender (required)"
                value={formValues.gender}
                onChange={(value) => updateField('gender', value)}
                options={genderOptions}
                placeholder="Gender"
                error={fieldErrors.gender}
              />
            </div>

            {submitError ? (
              <div className="text-red-400 text-xs">{submitError}</div>
            ) : null}

            <ContinueButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Continue'}
            </ContinueButton>
          </form>
        </div>
      </div>
      {showConfirmation && (
        <EmailSentConfirmation
          email={formValues.email}
          onBackToRegister={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default RegistrationForm;
