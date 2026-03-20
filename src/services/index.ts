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

import type { UploadTrackService } from '@/types';

type TrackVisibilityApi = Pick<
  TrackService,
  | 'getTrackMetadata'
  | 'getTrackVisibility'
  | 'updateTrackVisibility'
  | 'getSecretLink'
  | 'regenerateSecretLink'
>;

const resolveTrackService = (): TrackService => {
  if (config.api.useMock) {
    return new MockTrackService();
  }
  return new RealTrackService();
};

export const trackService = resolveTrackService();

/**
 * Backward-compatible upload function.
 * Prefer consuming `trackService.uploadTrack` directly in new code.
 */
export const uploadTrackService: UploadTrackService = (
  formData,
  token,
  onProgress
) => trackService.uploadTrack(formData, token, onProgress);

/**
 * Backward-compatible visibility service shape.
 * Prefer consuming `trackService` directly in new code.
 */
export const trackVisibilityService: TrackVisibilityApi = trackService;

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

