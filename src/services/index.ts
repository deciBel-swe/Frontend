/**
 * Services Barrel Export
 *
 * Dependency-injection entry point.
 * Switches between mock and real services based on `NEXT_PUBLIC_USE_MOCK`.
 */

import { config } from '@/config';

import type { AuthService } from './api/authService';
import { RealAuthService } from '@/services/api/authService';
import { MockAuthService } from './mocks/authService';

import type { PrivacyService } from './api/privacyService';
import { RealPrivacyService } from './api/privacyService';
import { MockPrivacyService } from './mocks/privacyService';

import type { TrackService } from '@/services/api/trackService';
import { RealTrackService } from '@/services/api/trackService';
import { MockTrackService } from '@/services/mocks/trackService';

import type { CountryService } from './api/countryService';
import { RealCountryService } from './api/countryService';
import { MockCountryService } from './mocks/countryService';

import type { UserService } from './api/userService';
import { RealUserService } from './api/userService';
import { MockUserService } from './mocks/userService';

const resolveTrackService = (): TrackService => {
  if (config.api.useMock) {
    return new MockTrackService();
  }
  return new RealTrackService();
};

export const trackService = resolveTrackService();

// --- Auth Service ---
const resolveAuthService = (): AuthService => {
  if (config.api.useMock) {
    return new MockAuthService();
  }
  return new RealAuthService();
};

export const authService = resolveAuthService();

// --- Privacy Service ---
const resolvePrivacyService = (): PrivacyService => {
  if (config.api.useMock) {
    return new MockPrivacyService();
  }
  return new RealPrivacyService();
};

export const privacyService = resolvePrivacyService();

const resolveCountryService = (): CountryService => {
  if (config.api.useMock) {
    return new MockCountryService();
  }
  return new RealCountryService();
};

export const countryService = resolveCountryService();

const resolveUserService = (): UserService => {
  if (config.api.useMock) {
    return new MockUserService();
  }
  return new RealUserService();
};

export const userService = resolveUserService();
