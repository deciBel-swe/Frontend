import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export interface ReCaptchaResult {
  success: boolean;
  score?: number;
  error?: string;
}

export const useReCaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

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