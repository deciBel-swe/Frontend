import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { authService } from '@/services';
import type { ReCaptchaVerificationResult } from '@/services/api/authService';

/**
 * Result object returned from reCAPTCHA verification
 * @interface ReCaptchaResult
 * @property {boolean} success - Whether the reCAPTCHA verification was successful
 * @property {number} [score] - Confidence score from Google (0.0 - 1.0), where 1.0 is very likely a legitimate user
 * @property {string} [error] - Error message if verification failed
 */
export type ReCaptchaResult = ReCaptchaVerificationResult;

/**
 * Hook for reCAPTCHA v3 verification
 *
 * Provides a function to execute reCAPTCHA token verification for form submissions.
 * Must be used within a ReCaptchaProvider.
 *
 * The verification process:
 * 1. Executes reCAPTCHA on the client to get a token
 * 2. Delegates token verification to the configured auth service
 * 3. Returns the verification result and score
 *
 * @hook
 * @returns {Object} Hook return object
 * @returns {(action?: string) => Promise<ReCaptchaResult>} verifyReCaptcha - Function to verify reCAPTCHA token
 *
 * @example
 * const { verifyReCaptcha } = useReCaptcha();
 * const result = await verifyReCaptcha('signin');
 * if (result.success) {
 *   console.log('User score:', result.score);
 * } else {
 *   console.error('Verification failed:', result.error);
 * }
 */
export const useReCaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  /**
   * Verifies a reCAPTCHA token with the backend
   *
   * @param {string} [action='submit_form'] - Action identifier for reCAPTCHA (e.g., 'signin', 'reset_password', 'submit_form')
   * @returns {Promise<ReCaptchaResult>} Verification result containing success status and optional score/error
   */
  const verifyReCaptcha = async (
    action: string = 'submit_form'
  ): Promise<ReCaptchaResult> => {
    if (!executeRecaptcha) {
      return { success: false, error: 'ReCaptcha not loaded' };
    }

    try {
      // Get the token
      const token = await executeRecaptcha(action);
      console.log('ReCaptcha token:', token);

      const verificationResult = await authService.verifyReCaptcha(
        token,
        action
      );

      if (verificationResult.success) {
        console.log(
          'ReCaptcha verification successful, score:',
          verificationResult.score
        );
        return {
          success: true,
          score: verificationResult.score,
        };
      } else {
        console.log(
          'ReCaptcha verification failed, score:',
          verificationResult.score,
          'error:',
          verificationResult.error
        );
        return {
          success: false,
          score: verificationResult.score,
          error: verificationResult.error || 'Verification failed',
        };
      }
    } catch (error) {
      console.error('ReCaptcha verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  return { verifyReCaptcha };
};
