import type { AdminLoginFormValues } from './types';

export const ADMIN_LOGIN_REDIRECT = '/admin/analytics';
export const ADMIN_ACCESS_TOKEN_STORAGE_KEY = 'decibel_admin_access_token';
export const ADMIN_AUTH_COOKIE = 'decibel_admin_auth';
export const ADMIN_USER_STORAGE_KEY = 'decibel_admin_user';

export const ADMIN_LOGIN_DEFAULT_VALUES: AdminLoginFormValues = {
  email: '',
  password: '',
};

export const ADMIN_LOGIN_COPY = {
  eyebrow: 'Decibel administration',
  title: 'Admin Console Login',
  subtitle:
    'Use your administrator credentials to access moderation, analytics, and platform controls.',
  securityTitle: 'Secure access policy',
  securityPoints: [
    'Administrative access is restricted to approved staff accounts.',
    'Every sign-in is tied to device metadata for audit and recovery flows.',
    'Unauthorized users are blocked before entering the admin workspace.',
  ],
  supportLabel: 'Access issues',
  supportText:
    'If your account should have admin privileges but access is denied, verify your role assignment before retrying.',
  formTitle: 'Sign in',
  formSubtitle: 'Enter your admin email and password to continue.',
  emailLabel: 'Admin email',
  passwordLabel: 'Password',
  submitLabel: 'Access admin console',
  signingInLabel: 'Signing in...',
  helperText:
    'This request is sent to POST /admin/login without an Authorization header.',
} as const;
