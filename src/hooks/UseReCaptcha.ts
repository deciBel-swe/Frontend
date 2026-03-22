import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export interface ReCaptchaResult {
  success: boolean;
  token?: string;
  error?: string;
}

/**
 * Result object returned from reCAPTCHA execution
 * @interface ReCaptchaResult
 * @property {boolean} success - Whether the reCAPTCHA verification was successful
 * @property {string} [token] - reCAPTCHA token to pass in API payloads that require captchaToken
 * @property {string} [error] - Error message if token generation failed
 */

/**
 * Hook for reCAPTCHA v3 verification
 *
 * Provides a function to execute reCAPTCHA and return a token for form submissions.
 * Must be used within a ReCaptchaProvider.
 *
 * The verification process:
 * 1. Executes reCAPTCHA on the client to get a token
 * 2. Returns the generated token for endpoints that accept captchaToken in payload
 *
 * @hook
 * @returns {Object} Hook return object
 * @returns {(action?: string) => Promise<ReCaptchaResult>} getRecaptchaToken - Function to get reCAPTCHA token
 *
 * @example
 * const { getRecaptchaToken } = useReCaptcha();
 * const result = await getRecaptchaToken('register_local');
 * if (result.success) {
 *   console.log('Captcha token:', result.token);
 * } else {
 *   console.error('Token generation failed:', result.error);
 * }
 */
export const useReCaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const isRuntimeReady = (): boolean => {
    if (typeof window === 'undefined') return false;

    const runtime = window as Window & {
      grecaptcha?: { execute?: unknown };
      ___grecaptcha_cfg?: { auto_render_clients?: unknown; clients?: unknown };
    };

    return (
      typeof runtime.grecaptcha?.execute === 'function' &&
      runtime.___grecaptcha_cfg !== undefined &&
      (runtime.___grecaptcha_cfg.auto_render_clients !== undefined ||
        runtime.___grecaptcha_cfg.clients !== undefined)
    );
  };

  /**
   * Verifies a reCAPTCHA token with the backend
   *
   * @param {string} [action='submit_form'] - Action identifier for reCAPTCHA
   * @returns {Promise<ReCaptchaResult>} Result containing success status and token/error
   */
  const getRecaptchaToken = async (
    action: string = 'submit_form'
  ): Promise<ReCaptchaResult> => {
    if (!executeRecaptcha) {
      return { success: false, error: 'ReCaptcha not loaded' };
    }

    if (!isRuntimeReady()) {
      return {
        success: false,
        error: 'ReCaptcha is initializing. Please try again in a moment.',
      };
    }

    try {
      // Get the token
      const token = await executeRecaptcha(action);
      if (!token || !token.trim()) {
        return { success: false, error: 'Failed to generate captcha token' };
      }

      return { success: true, token };
    } catch (error) {
      console.error('ReCaptcha token generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  return { getRecaptchaToken };
};
