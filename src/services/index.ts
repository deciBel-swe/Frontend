/**
 * Services Barrel Export
 *
 * Dependency-injection entry point.
 * Switches between mock and real services based on `NEXT_PUBLIC_USE_MOCK`.
 */

import { config } from '@/config';

import type { AuthService } from './api/authService';
import { MockAuthService } from './mocks/authService';
import { uploadTrack } from "@/services/api/uploadService"
import { uploadTrackMock } from "@/services/mocks/uploadService"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export const uploadTrackService = (
  formData: FormData,
  token: string,
  onProgress: (progress: number) => void
) => {

  if (USE_MOCK) {
    return uploadTrackMock(onProgress)
  }

  return uploadTrack(formData, token, onProgress)
}
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
