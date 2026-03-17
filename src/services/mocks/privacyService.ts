import type { PrivacyService } from '@/services/api/privacyService';
import type { PrivacySettings, UpdatePrivacySettingsDto } from '@/types/privacy';

// reuse the same delay helper from auth mock or recreate here
const MOCK_DELAY_MS = 200;
const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

const STORAGE_KEY = 'decibel_mock_privacy_settings';
const DEFAULT: PrivacySettings = { isPrivate: false, showHistory: true };

/*
 * Mock implementation that persists to localStorage so tests and the app can
 * exercise state changes easily. We deliberately keep the interface small so
 * swapping in the real service requires no changes outside of the DI layer.
 */
export class MockPrivacyService implements PrivacyService {
  private _read(): PrivacySettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT;
    } catch {
      return DEFAULT;
    }
  }

  private _write(settings: PrivacySettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  async getPrivacySettings(): Promise<PrivacySettings> {
    await delay();
    return this._read();
  }

  async updatePrivacySettings(
    data: UpdatePrivacySettingsDto
  ): Promise<PrivacySettings> {
    await delay();
    const current = this._read();
    const updated = { ...current, ...data };
    this._write(updated);
    return updated;
  }
}
