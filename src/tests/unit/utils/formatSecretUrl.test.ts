import { config } from '@/config';
import { formatSecretUrl } from '@/utils/formatSecretUrl';

describe('formatSecretUrl', () => {
  it('builds a full secret track URL from app config, track id, and token', () => {
    const url = formatSecretUrl('42', 'token-abc');

    expect(url).toBe(`${config.api.appUrl}/tracks/42?s=token-abc`);
  });

  it('keeps track id and token values in the output URL', () => {
    const url = formatSecretUrl('track-001', 'nQ7ENR_Pl-123');

    expect(url).toContain('/tracks/track-001');
    expect(url).toContain('?s=nQ7ENR_Pl-123');
  });
});
