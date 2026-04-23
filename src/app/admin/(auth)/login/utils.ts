import { config } from '@/config';
import {
  ADMIN_AUTH_COOKIE,
  ADMIN_ACCESS_TOKEN_STORAGE_KEY,
  ADMIN_USER_STORAGE_KEY,
} from './constants';
import type { AdminApiError } from './types';
import type { DeviceInfoDTO } from '@/types';
import {
  adminLoginResponseSchema,
  type AdminLoginResponse,
} from '@/types/admin';

const getDeviceType = (): DeviceInfoDTO['deviceType'] => {
  if (typeof window === 'undefined') {
    return 'DESKTOP';
  }

  if (window.innerWidth < 768) {
    return 'MOBILE';
  }

  if (window.innerWidth < 1024) {
    return 'TABLET';
  }

  return 'DESKTOP';
};

const detectPlatform = (userAgent: string): string => {
  if (/windows/i.test(userAgent)) {
    return 'Windows';
  }

  if (/mac os|macintosh/i.test(userAgent)) {
    return 'macOS';
  }

  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  if (/iphone|ipad|ios/i.test(userAgent)) {
    return 'iOS';
  }

  if (/linux/i.test(userAgent)) {
    return 'Linux';
  }

  return 'Unknown OS';
};

const detectBrowser = (userAgent: string): string => {
  if (/edg/i.test(userAgent)) {
    return 'Edge';
  }

  if (/chrome|crios/i.test(userAgent) && !/edg/i.test(userAgent)) {
    return 'Chrome';
  }

  if (/safari/i.test(userAgent) && !/chrome|crios|edg/i.test(userAgent)) {
    return 'Safari';
  }

  if (/firefox|fxios/i.test(userAgent)) {
    return 'Firefox';
  }

  return 'Browser';
};

export const buildAdminDeviceInfo = (): DeviceInfoDTO => {
  const userAgent =
    typeof navigator === 'undefined' ? 'unknown-device' : navigator.userAgent;
  const browser = detectBrowser(userAgent);
  const platform = detectPlatform(userAgent);

  return {
    deviceType: getDeviceType(),
    fingerPrint: userAgent,
    deviceName: `${browser} on ${platform}`,
  };
};

export const persistAdminSession = (response: AdminLoginResponse): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    ADMIN_ACCESS_TOKEN_STORAGE_KEY,
    response.accessToken
  );
  window.localStorage.setItem(
    ADMIN_USER_STORAGE_KEY,
    JSON.stringify(response.adminUser)
  );

  document.cookie = `${ADMIN_AUTH_COOKIE}=${response.accessToken}; path=/; max-age=${response.expiresIn}; SameSite=Lax`;
};

const toAdminApiError = async (response: Response): Promise<AdminApiError> => {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string'
  ) {
    return {
      status: response.status,
      message: payload.message,
    };
  }

  return {
    status: response.status,
    message: 'Unable to sign in to the admin console.',
  };
};

const getMockAdminLoginResponse = (): AdminLoginResponse => ({
  accessToken: 'mock-admin-access-token',
  expiresIn: 3600,
  adminUser: {
    id: 1,
    username: 'admin_system',
    avatarURL: '/images/default_song_image.png',
  },
});

export const requestAdminLogin = async (
  email: string,
  password: string
): Promise<AdminLoginResponse> => {
  if (config.api.useMock) {
    return getMockAdminLoginResponse();
  }

  const response = await fetch(`${config.api.baseURL}/admin/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      deviceInfo: buildAdminDeviceInfo(),
    }),
  });

  if (!response.ok) {
    throw await toAdminApiError(response);
  }

  const payload = await response.json();
  return adminLoginResponseSchema.parse(payload);
};

export const getAdminSubmitErrorMessage = (error: unknown): string => {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Unable to sign in to the admin console.';
};
