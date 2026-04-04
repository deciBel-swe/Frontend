import { sha256Hex } from '@/utils/sha256';
import { webcrypto } from 'crypto';
import { TextEncoder } from 'util';

beforeAll(() => {
  if (!globalThis.TextEncoder) {
    Object.defineProperty(globalThis, 'TextEncoder', {
      configurable: true,
      value: TextEncoder,
    });
  }

  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: webcrypto,
    });
  }
});

describe('sha256Hex', () => {
  it('returns expected SHA-256 digest for known input', async () => {
    await expect(sha256Hex('abc')).resolves.toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });
});
