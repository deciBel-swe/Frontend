import { z } from 'zod';
import { trackPrivacyValueSchema } from './tracks';

const MAX_TITLE_LENGTH = 300;
const MAX_ARTIST_LENGTH = 120;
const MAX_GENRE_LENGTH = 80;
const MAX_TAG_LENGTH = 40;
const MAX_TAGS = 20;
const MAX_DESCRIPTION_LENGTH = 5000;

const safeTextPattern = /^[a-zA-Z0-9\s\-_'".,!?&() ]+$/;
const hasInvalidControlChars = (value: string): boolean =>
  [...value].some((char) => {
    const code = char.charCodeAt(0);
    const isAllowedWhitespace = code === 9 || code === 10 || code === 13;
    return code < 32 && !isAllowedWhitespace;
  });

const emptyToUndefined = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim().length === 0 ? undefined : value;
};

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Track link is required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Track link must be a valid slug');

export const uploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Please enter a title')
    .max(MAX_TITLE_LENGTH, 'Title is too long')
    .regex(safeTextPattern, 'Title contains invalid symbols'),
  trackLinkSuffix: slugSchema,
  artist: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(MAX_ARTIST_LENGTH, 'Artist name is too long')
      .regex(safeTextPattern, 'Artist name contains invalid symbols')
      .optional()
  ),
  genre: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(MAX_GENRE_LENGTH, 'Genre is too long')
      .regex(safeTextPattern, 'Genre contains invalid symbols')
      .optional()
  ),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(MAX_TAG_LENGTH)
        .regex(/^[a-z0-9-]*$/, 'Tags can only contain lowercase letters, numbers, and hyphens')
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
