import { validateAudioFile, validateImageFile } from '@/utils/fileValidation';

const fileFromBytes = (bytes: number[]): File => {
  const payload = new Uint8Array(bytes);
  return {
    slice: (start: number, end: number) => ({
      arrayBuffer: async () =>
        payload.slice(start, end).buffer as ArrayBuffer,
    }),
  } as unknown as File;
};

describe('fileValidation', () => {
  it('accepts supported image signatures', async () => {
    const png = fileFromBytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const jpeg = fileFromBytes([0xff, 0xd8, 0xff, 0xdb]);
    const riffWebp = fileFromBytes(
      [
        0x52,
        0x49,
        0x46,
        0x46,
        0x00,
        0x00,
        0x00,
        0x00,
        0x57,
        0x45,
        0x42,
        0x50,
      ]
    );

    await expect(validateImageFile(png)).resolves.toEqual({
      ok: true,
      detectedType: 'png',
    });
    await expect(validateImageFile(jpeg)).resolves.toEqual({
      ok: true,
      detectedType: 'jpeg',
    });
    await expect(validateImageFile(riffWebp)).resolves.toEqual({
      ok: true,
      detectedType: 'webp',
    });
  });

  it('rejects unsupported but detected images and unknown image payloads', async () => {
    const gif = fileFromBytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    const unknown = fileFromBytes([0x01, 0x02, 0x03, 0x04]);

    await expect(validateImageFile(gif)).resolves.toEqual({
      ok: false,
      detectedType: 'gif',
      reason: 'Unsupported image format. Please upload PNG, JPG, or WEBP.',
    });

    await expect(validateImageFile(unknown)).resolves.toEqual({
      ok: false,
      reason: 'File content does not match a supported image format.',
    });
  });

  it('accepts supported audio signatures', async () => {
    const wav = fileFromBytes(
      [
        0x52,
        0x49,
        0x46,
        0x46,
        0x00,
        0x00,
        0x00,
        0x00,
        0x57,
        0x41,
        0x56,
        0x45,
      ]
    );
    const flac = fileFromBytes([0x66, 0x4c, 0x61, 0x43]);
    const aac = fileFromBytes([0xff, 0xf1]);
    const mp3Id3 = fileFromBytes([0x49, 0x44, 0x33, 0x04]);
    const mp3Frame = fileFromBytes([0xff, 0xe2, 0x00]);
    const m4a = fileFromBytes(
      [
        0x00,
        0x00,
        0x00,
        0x18,
        0x66,
        0x74,
        0x79,
        0x70,
        0x4d,
        0x34,
        0x41,
        0x20,
      ]
    );

    await expect(validateAudioFile(wav)).resolves.toEqual({ ok: true, detectedType: 'wav' });
    await expect(validateAudioFile(flac)).resolves.toEqual({ ok: true, detectedType: 'flac' });
    await expect(validateAudioFile(aac)).resolves.toEqual({ ok: true, detectedType: 'aac' });
    await expect(validateAudioFile(mp3Id3)).resolves.toEqual({ ok: true, detectedType: 'mp3' });
    await expect(validateAudioFile(mp3Frame)).resolves.toEqual({ ok: true, detectedType: 'mp3' });
    await expect(validateAudioFile(m4a)).resolves.toEqual({ ok: true, detectedType: 'm4a' });
  });

  it('rejects unknown audio payloads', async () => {
    const unknown = fileFromBytes([0x10, 0x20, 0x30]);

    await expect(validateAudioFile(unknown)).resolves.toEqual({
      ok: false,
      reason: 'File content does not match a supported audio format.',
    });
  });
});
