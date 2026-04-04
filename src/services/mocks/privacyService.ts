import type { PrivacyService } from '@/services/api/privacyService';
import type {
  PrivacySettings,
  UpdatePrivacySettingsDto,
} from '@/types/privacy';
import {
  getMockUsersStore,
  persistMockSystemState,
  resolveCurrentMockUserId,
  syncAuthAccountsToMockUsers,
} from './mockSystemStore';

// reuse the same delay helper from auth mock or recreate here
const MOCK_DELAY_MS = 200;
const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

export class MockPrivacyService implements PrivacyService {
  private _getCurrentUserPrivacy(): PrivacySettings {
    syncAuthAccountsToMockUsers();
    const currentUserId = resolveCurrentMockUserId();
    const user = getMockUsersStore().find(
      (entry) => entry.id === currentUserId
    );

    if (!user) {
      return { isPrivate: false, showHistory: true };
    }

    return user.privacySettings;
  }

  async getPrivacySettings(): Promise<PrivacySettings> {
    await delay();
    const current = this._getCurrentUserPrivacy();
    return { ...current };
  }

  async updatePrivacySettings(
    data: UpdatePrivacySettingsDto
  ): Promise<PrivacySettings> {
    await delay();
    const current = this._getCurrentUserPrivacy();
    current.isPrivate = data.isPrivate;
    current.showHistory = data.showHistory;
    persistMockSystemState();
    return { ...current };
  }
}
