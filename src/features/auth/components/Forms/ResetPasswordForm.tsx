'use client';

import { useState } from 'react';

import { authService } from '@/services';
import ContinueButton from '../ContinueButton';
import EmailSentConfirmation from './EmailSentConfirmation';
import FloatingInputField from '../FormFields/FloatingInputField';
import { useReCaptcha } from '@/hooks/UseReCaptcha';
import type { FC, FormEvent } from 'react';

import {
  getSchemaFieldErrors,
  signInSchema,
  type FieldErrors,
  type SignInFormValues,
} from '@/types/authSchemas';

/**
 * Props for the ResetPasswordForm component
 * @interface ResetPasswordFormProps
 * @property {string} [email] - Optional pre-filled email address
 * @property {(email: string) => void} [onSend] - Callback function invoked when password reset is requested
 */
interface ResetPasswordFormProps {
  email?: string;
  onSend?: (email: string) => Promise<void> | void;
}

type ResetPasswordFormValues = Pick<SignInFormValues, 'email'>;
const resetPasswordSchema = signInSchema.pick({ email: true });

/**
 * ResetPasswordForm Component
 *
 * A modal form that allows users to initiate a password reset by submitting their email address.
 * Performs reCAPTCHA verification before submission to prevent abuse.
 *
 * @component
 * @param {ResetPasswordFormProps} props - Component props
 * @returns {JSX.Element} The reset password form modal
 *
 * @example
 * <ReCaptchaProvider>
 *   <ResetPasswordForm onSend={(email) => sendResetEmail(email)} />
 * </ReCaptchaProvider>
 */
const ResetPasswordForm: FC<ResetPasswordFormProps> = ({
  email: initialEmail = '',
  onSend,
}) => {
  const [formValues, setFormValues] = useState<ResetPasswordFormValues>({
    email: initialEmail,
  });
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<ResetPasswordFormValues>
  >({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const isFormComplete = resetPasswordSchema.safeParse(formValues).success;
  const { getRecaptchaToken } = useReCaptcha();

  const updateEmail = (value: string) => {
    setFormValues({ email: value });
    setSubmitError('');
    setFieldErrors((previous) =>
      previous.email ? { ...previous, email: undefined } : previous
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedValues = resetPasswordSchema.safeParse(formValues);
    if (!parsedValues.success) {
      setFieldErrors(getSchemaFieldErrors(parsedValues.error));
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const recaptchaResult = await getRecaptchaToken('reset_password');
      if (!recaptchaResult.success) {
        setFieldErrors({
          email:
            recaptchaResult.error ||
            'ReCaptcha verification failed. Please try again.',
        });
        return;
      }

      setFieldErrors({});

      if (onSend) {
        await onSend(parsedValues.data.email);
      } else {
        await authService.forgotPassword(parsedValues.data.email);
      }

      setShowConfirmation(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'We could not send a reset link right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-bg-base px-4">
      <div className="w-110 h-fit py-5 border-2 border-border-default flex items-start justify-center rounded">
        <div className="w-100 h-fit bg-bg-base">
          <div className="mb-6 flex items-center gap-4">
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Reset password
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-3">
            <FloatingInputField
              type="email"
              name="email"
              autoComplete="email"
              label="Your email address"
              value={formValues.email}
              onChange={updateEmail}
              error={fieldErrors.email}
            />

            <p className="text-sm text-text-muted">
              If the email address is in our database, we will send you an email
              to reset your password.
            </p>

            {submitError ? <p className="text-red-400 text-xs">{submitError}</p> : null}

            <ContinueButton type="submit" disabled={!isFormComplete || isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </ContinueButton>
          </form>
        </div>
      </div>

      {showConfirmation && (
        <EmailSentConfirmation
          email={formValues.email}
          onBackToRegister={() => setShowConfirmation(false)}
          variant="password-reset"
        />
      )}
    </div>
  );
};

export default ResetPasswordForm;
