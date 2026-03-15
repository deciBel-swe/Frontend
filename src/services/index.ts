/**
 * Services Barrel Export
 *
 * Dependency-injection entry point.
 * Switches between mock and real services based on `NEXT_PUBLIC_USE_MOCK`.
 */

import { config } from '@/config';

import type { AuthService } from './api/authService';
import { MockAuthService } from './mocks/authService';
// ─── Track visibility service  ───────────────────────────────────────
import { RealTrackVisibilityService } from '@/services/api/trackVisibilityService';
import { MockTrackVisibilityService } from '@/services/mocks/trackVisibilityService';
import type { TrackVisibilityService } from '@/services/api/trackVisibilityService';
 

// --- Auth Service ---
// When the real API client is implemented, import RealAuthService here
// and toggle via `config.api.useMock`.
const resolveAuthService = (): AuthService => {
  if (config.api.useMock) {
    return new MockAuthService();
  }
  // TODO: replace with RealAuthService once implemented
  return new MockAuthService();
};

export const authService = resolveAuthService();

export const trackVisibilityService: TrackVisibilityService = config.api.useMock
  ? new MockTrackVisibilityService()
  : new RealTrackVisibilityService();
