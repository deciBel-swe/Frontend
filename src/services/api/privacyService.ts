import { apiRequest } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  PrivacySettings,
  UpdatePrivacySettingsDto,
} from '@/types/privacy';

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
  updatePrivacySettings(
    data: UpdatePrivacySettingsDto
  ): Promise<PrivacySettings>;
}

/** Real implementation backed by the centralized axios + Zod API template. */
export class RealPrivacyService implements PrivacyService {
  async getPrivacySettings(): Promise<PrivacySettings> {
    return apiRequest(API_CONTRACTS.USERS_ME_PRIVACY);
  }

  async updatePrivacySettings(
    data: UpdatePrivacySettingsDto
  ): Promise<PrivacySettings> {
    return apiRequest(API_CONTRACTS.USERS_ME_PRIVACY_UPDATE, {
      payload: data,
    });
  }
}
