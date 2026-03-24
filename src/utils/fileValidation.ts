type ValidationResult = {
  ok: boolean;
  reason?: string;
  detectedType?: string;
};

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const GIF87_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];
const GIF89_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];
const BMP_SIGNATURE = [0x42, 0x4d];
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50];
const WAVE_SIGNATURE = [0x57, 0x41, 0x56, 0x45];
const FLAC_SIGNATURE = [0x66, 0x4c, 0x61, 0x43];
const ID3_SIGNATURE = [0x49, 0x44, 0x33];

const MP4_BRANDS = new Set(['M4A ', 'M4B ', 'isom', 'iso2', 'mp41', 'mp42', 'mp4a']);

const readHeader = async (file: File, length: number): Promise<Uint8Array> => {
  const buffer = await file.slice(0, length).arrayBuffer();
  return new Uint8Array(buffer);
};

const hasSignature = (
  bytes: Uint8Array,
  signature: number[],
  offset = 0
): boolean => {
  if (bytes.length < offset + signature.length) {
    return false;
  }

  return signature.every((value, index) => bytes[offset + index] === value);
};

const toAscii = (bytes: Uint8Array, start: number, length: number): string => {
  if (bytes.length < start + length) {
    return '';
  }

  return String.fromCharCode(...bytes.slice(start, start + length));
};


const detectImageType = (bytes: Uint8Array): string | null => {
  if (hasSignature(bytes, PNG_SIGNATURE)) return 'png';
  if (hasSignature(bytes, JPEG_SIGNATURE)) return 'jpeg';
  if (
    hasSignature(bytes, GIF87_SIGNATURE) ||
    hasSignature(bytes, GIF89_SIGNATURE)
  ) {
    return 'gif';
  }
  if (hasSignature(bytes, BMP_SIGNATURE)) return 'bmp';
  if (
    hasSignature(bytes, RIFF_SIGNATURE) &&
    hasSignature(bytes, WEBP_SIGNATURE, 8)
  ) {
    return 'webp';
  }

  return null;
};

const isAdtsAac = (bytes: Uint8Array): boolean => {
  if (bytes.length < 2) return false;
  return bytes[0] === 0xff && (bytes[1] === 0xf1 || bytes[1] === 0xf9);
};

const isMp3FrameSync = (bytes: Uint8Array): boolean => {
  if (bytes.length < 2) return false;
  return bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
};

const isMp4Container = (bytes: Uint8Array): boolean => {
  if (toAscii(bytes, 4, 4) !== 'ftyp') return false;
  const brand = toAscii(bytes, 8, 4);
  return MP4_BRANDS.has(brand);
};

const detectAudioType = (bytes: Uint8Array): string | null => {
  if (
    hasSignature(bytes, RIFF_SIGNATURE) &&
    hasSignature(bytes, WAVE_SIGNATURE, 8)
  ) {
    return 'wav';
  }
  if (hasSignature(bytes, FLAC_SIGNATURE)) return 'flac';
  if (isAdtsAac(bytes)) return 'aac';
  if (hasSignature(bytes, ID3_SIGNATURE) || isMp3FrameSync(bytes)) return 'mp3';
  if (isMp4Container(bytes)) return 'm4a';

  return null;
};

export const validateImageFile = async (
  file: File
): Promise<ValidationResult> => {
  const header = await readHeader(file, 16);

  const detectedType = detectImageType(header);
  if (detectedType === 'png' || detectedType === 'jpeg' || detectedType === 'webp') {
    return { ok: true, detectedType };
  }

  if (detectedType) {
    return {
      ok: false,
      reason: 'Unsupported image format. Please upload PNG, JPG, or WEBP.',
      detectedType,
    };
  }

  return {
    ok: false,
    reason: 'File content does not match a supported image format.',
  };
};

export const validateAudioFile = async (
  file: File
): Promise<ValidationResult> => {
  const header = await readHeader(file, 16);

  const detectedType = detectAudioType(header);
  if (detectedType) {
    return { ok: true, detectedType };
  }

  return {
    ok: false,
    reason: 'File content does not match a supported audio format.',
  };
};
