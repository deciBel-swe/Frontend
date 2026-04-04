import { z } from 'zod';
import { trackPrivacyValueSchema } from './tracks';

export const MAX_TITLE_LENGTH = 300;
export const MAX_GENRE_LENGTH = 80;
export const MAX_TAG_LENGTH = 40;
export const MAX_TAGS = 20;
export const MAX_DESCRIPTION_LENGTH = 5000;

const safeTextPattern =
  /^[\p{L}\p{N}\s\-_'".,!?&()]+$/u;
const hasInvalidControlChars = (value: string): boolean =>
  [...value].some((char) => {
    const code = char.charCodeAt(0);
    const isAllowedWhitespace = code === 9 || code === 10 || code === 13;
    return code < 32 && !isAllowedWhitespace;
  });

const getTodayIsoDate = (): string => new Date().toISOString().slice(0, 10);

export const uploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Please enter a title')
    .max(MAX_TITLE_LENGTH, 'Title is too long')
    .regex(safeTextPattern, 'Title contains invalid symbols'),
  genre:z
      .string()
      .trim()
      .max(MAX_GENRE_LENGTH, 'Genre is too long')
      .min(1, 'Genre cannot be empty')
      .regex(safeTextPattern, 'Genre contains invalid symbols'),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(MAX_TAG_LENGTH)
        .regex(
          /^[a-z0-9-]*$/,
          'Tags can only contain lowercase letters, numbers, and hyphens'
        )
    )
    .max(MAX_TAGS, 'Maximum 20 tags'),
  description: z
    .string()
    .max(
      MAX_DESCRIPTION_LENGTH,
      'Description is too long (max 5000 characters)'
    )
    .refine(
      (value) => !hasInvalidControlChars(value),
      'Description contains invalid symbols'
    )
    .optional(),
  releaseDate: z
    .string()
    .trim()
    .min(1, 'Release date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Release date must be YYYY-MM-DD')
    .refine((value) => value <= getTodayIsoDate(), 'Release date cannot be in the future'),
  privacy: trackPrivacyValueSchema,
});

export type UploadFormValues = z.infer<typeof uploadSchema>;

export const toTrackSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
