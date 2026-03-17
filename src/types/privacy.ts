export interface PrivacySettings {
  isPrivate: boolean;
  showHistory: boolean;
}

export interface UpdatePrivacySettingsDto {
  isPrivate?: boolean;
  showHistory?: boolean;
}