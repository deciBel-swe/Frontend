import { useCallback, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { RegisterDeviceTokenRequest } from '@/types/notification';
import type { MessageResponse } from '@/types/user';

/**
 * useRegisterDeviceToken Hook
 *
 * Mutation hook for registering a device token for push notifications.
 *
 * Features:
 * - Registers device token with backend
 * - Specifies device type (DESKTOP, MOBILE, TABLET, etc.)
 * - Loading, error, and success state tracking
 * - Throws error on failure for error handling in UI
 *
 * Usage:
 * - Call after user logs in
 * - Pass Firebase Cloud Messaging token
 * - Specify device type for backend to target correct platform
 *
 * @returns Object with registerDeviceToken function, response, and loading/error states
 *
 * @example
 * const { registerDeviceToken, isLoading, isError, error } = useRegisterDeviceToken();
 *
 * // In app initialization or after login
 * const handleRegisterPushNotifications = async () => {
 *   try {
 *     const messaging = getMessaging();
 *     const token = await getToken(messaging, { vapidKey: 'your-vapid-key' });
 *
 *     await registerDeviceToken({
 *       token,
 *       deviceType: 'DESKTOP',
 *     });
 *     console.log('Device registered for push notifications');
 *   } catch (err) {
 *     console.error('Failed to register:', error?.message);
 *   }
 * };
 *
 * return (
 *   <button onClick={handleRegisterPushNotifications} disabled={isLoading}>
 *     Enable Push Notifications
 *   </button>
 * );
 */
export function useRegisterDeviceToken() {
  const [registerDeviceTokenResponse, setRegisterDeviceTokenResponse] =
    useState<MessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const registerDeviceToken = useCallback(
    async (payload: RegisterDeviceTokenRequest) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const result = await notificationService.registerDeviceToken(payload);
        setRegisterDeviceTokenResponse(result);
        return result;
      } catch (caughtError) {
        const normalizedError = normalizeApiError(caughtError);
        setIsError(true);
        setError(normalizedError);
        throw normalizedError;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    registerDeviceTokenResponse,
    registerDeviceToken,
    isLoading,
    isError,
    error,
  };
}
