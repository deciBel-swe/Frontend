import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

/**
 * Result object returned from reCAPTCHA verification
 * @interface ReCaptchaResult
 * @property {boolean} success - Whether the reCAPTCHA verification was successful
 * @property {number} [score] - Confidence score from Google (0.0 - 1.0), where 1.0 is very likely a legitimate user
 * @property {string} [error] - Error message if verification failed
 */
export interface ReCaptchaResult {
  success: boolean;
  score?: number;
  error?: string;
}

/**
 * Hook for reCAPTCHA v3 verification
 * 
 * Provides a function to execute reCAPTCHA token verification for form submissions.
 * Must be used within a ReCaptchaProvider.
 * 
 * The verification process:
 * 1. Executes reCAPTCHA on the client to get a token
 * 2. Sends the token to `/api/verify-recaptcha` for server-side verification
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
  const verifyReCaptcha = async (action: string = 'submit_form'): Promise<ReCaptchaResult> => {
    if (!executeRecaptcha) {
      return { success: false, error: 'ReCaptcha not loaded' };
    }

    try {
      // Get the token
      const token = await executeRecaptcha(action);
      console.log('ReCaptcha token:', token);

      // Verify the token with our API
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('ReCaptcha verification successful, score:', data.score);
        return { success: true, score: data.score };
      } else {
        console.log('ReCaptcha verification failed, score:', data.score, 'errors:', data.errors);
        return { success: false, score: data.score, error: 'Verification failed' };
      }
    } catch (error) {
      console.error('ReCaptcha verification error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return { verifyReCaptcha };
};