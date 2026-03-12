import { API_ENDPOINTS, getApiUrl } from '@/constants/routes';
import type { PrivacySettings, UpdatePrivacySettingsDto } from '@/types/privacy';

/**
 * Privacy service contract. Real and mock implementations must satisfy this.
 */
export interface PrivacyService {
  /** Retrieve the current user's privacy settings (GET /users/me/privacy) */
  getPrivacySettings(): Promise<PrivacySettings>;

  /**
   * Update privacy settings (PATCH /users/me/privacy). The server returns
   * the updated settings object on success.
   */
  updatePrivacySettings(data: UpdatePrivacySettingsDto): Promise<PrivacySettings>;
}

/**
 * Real implementation using the fetch API. The service is deliberately small
 * because the real network client hasn't been fleshed out yet; when a shared
 * http client exists we can refactor without touching callers.
 */
export class RealPrivacyService implements PrivacyService {
  async getPrivacySettings(): Promise<PrivacySettings> {
    const res = await fetch(getApiUrl(API_ENDPOINTS.USERS.ME_PRIVACY), {
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Failed to load privacy settings');
    }
    return res.json();
  }

  async updatePrivacySettings(
    data: UpdatePrivacySettingsDto
  ): Promise<PrivacySettings> {
    const res = await fetch(getApiUrl(API_ENDPOINTS.USERS.ME_PRIVACY), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('Failed to update privacy settings');
    }
    return res.json();
  }
}
