/**
 * Services Barrel Export
 *
 * Dependency-injection entry point.
 * Switches between mock and real services based on `NEXT_PUBLIC_USE_MOCK`.
 */

import { config } from '@/config';

import type { AuthService } from './api/authService';
import { MockAuthService } from './mocks/authService';

import type { PrivacyService } from './api/privacyService';
import { MockPrivacyService } from './mocks/privacyService';
import { RealPrivacyService } from './api/privacyService';
import { RealAuthService } from '@/services/api/authService';

// --- Auth Service ---
// When the real API client is implemented, import RealAuthService here
// and toggle via `config.api.useMock`.
const resolveAuthService = (): AuthService => {
  if (config.api.useMock) {
    return new MockAuthService();
  }
  // TODO: replace with RealAuthService once implemented
  return new RealAuthService();
};

export const authService = resolveAuthService();

// --- Privacy Service ---
// Provided in the same pattern so consumers can always import from
// `@/services` regardless of mock/real selection.
const resolvePrivacyService = (): PrivacyService => {
  if (config.api.useMock) {
    return new MockPrivacyService();
  }
  return new RealPrivacyService();
};

export const privacyService = resolvePrivacyService();
