import { z } from 'zod';
import type { UpdateMeRequest } from './user';

export type EditProfileFormValues = {
  displayName: string;
  city: string;
  country: string;
  bio: string;
  favoriteGenres: string[];
  website: string;
  instagram: string;
  twitter: string;
  avatar: File | string | null;
  coverImage: File | string | null;
};

export type EditProfileFormErrorKey =
  | 'displayName'
  | 'city'
  | 'country'
  | 'bio'
  | 'favoriteGenres'
  | 'website'
  | 'instagram'
  | 'twitter'
  | 'avatar'
  | 'coverImage';

export type EditProfileFormErrors = Partial<
  Record<EditProfileFormErrorKey, string>
>;

export const MAX_FAVORITE_GENRES = 10;
export const MAX_FAVORITE_GENRE_LENGTH = 40;

const favoriteGenreSchema = z
  .string()
  .trim()
  .min(1, 'Favorite genre cannot be empty')
  .max(
    MAX_FAVORITE_GENRE_LENGTH,
    `Favorite genre must be ${MAX_FAVORITE_GENRE_LENGTH} characters or fewer`
  )
  .regex(
    /^[a-zA-Z0-9-]+$/,
    'Favorite genres can only contain lowercase/uppercase letters, numbers, and hyphens'
  );

const isValidOptionalUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const avatarSchema = z.union([
  z.string().trim().max(2048),
  z.null(),
  z.custom<File>(
    (value) => typeof File !== 'undefined' && value instanceof File,
    {
      message: 'Avatar must be a valid file.',
    }
  ),
]);

export const editProfileSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters')
      .max(50, 'Display name must be 50 characters or fewer')
      .regex(
        /^[A-Za-z0-9 ._'-]+$/,
        "Display name can only contain letters, numbers, spaces, and . _ ' -"
      ),
    city: z.string().trim().max(80, 'City must be 80 characters or fewer'),
    country: z
      .string()
      .trim()
      .max(60, 'Country must be 60 characters or fewer'),
    bio: z.string().trim().max(200, 'Bio must be 200 characters or fewer'),
    favoriteGenres: z
      .array(favoriteGenreSchema)
      .max(
        MAX_FAVORITE_GENRES,
        `Maximum ${MAX_FAVORITE_GENRES} favorite genres allowed`
      ),
    website: z
      .string()
      .trim()
      .max(2048, 'Website URL is too long')
      .refine(isValidOptionalUrl, 'Website must be a valid URL'),
    instagram: z
      .string()
      .trim()
      .max(2048, 'Instagram URL is too long')
      .refine(isValidOptionalUrl, 'Instagram must be a valid URL'),
    twitter: z
      .string()
      .trim()
      .max(2048, 'Twitter/X URL is too long')
      .refine(isValidOptionalUrl, 'Twitter/X must be a valid URL'),
    avatar: avatarSchema,
    coverImage: avatarSchema,
  });

export const getEditProfileFormErrors = (
  values: EditProfileFormValues
): EditProfileFormErrors => {
  const result = editProfileSchema.safeParse(values);
  if (result.success) {
    return {};
  }

  const errors: EditProfileFormErrors = {};

  for (const issue of result.error.issues) {
    const pathKey = issue.path[0];
    if (typeof pathKey !== 'string') {
      continue;
    }

    if (
      (pathKey === 'displayName' ||
        pathKey === 'city' ||
        pathKey === 'country' ||
        pathKey === 'bio' ||
        pathKey === 'favoriteGenres' ||
        pathKey === 'website' ||
        pathKey === 'instagram' ||
        pathKey === 'twitter' ||
        pathKey === 'avatar' ||
        pathKey === 'coverImage') &&
      !errors[pathKey]
    ) {
      errors[pathKey] = issue.message;
    }
  }

  return errors;
};

export const buildSocialLinksFromFields = (
  values: Pick<EditProfileFormValues, 'website' | 'instagram' | 'twitter'>
): NonNullable<UpdateMeRequest['socialLinks']> => {
  const normalizeOptional = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const socialLinks: NonNullable<UpdateMeRequest['socialLinks']> = {};

  const instagram = normalizeOptional(values.instagram);
  if (instagram !== undefined) {
    socialLinks.instagram = instagram;
  }

  const twitter = normalizeOptional(values.twitter);
  if (twitter !== undefined) {
    socialLinks.twitter = twitter;
  }

  const website = normalizeOptional(values.website);
  if (website !== undefined) {
    socialLinks.website = website;
  }

  return socialLinks;
};

export const emptyEditProfileFormValues: EditProfileFormValues = {
  displayName: '',
  city: '',
  country: '',
  bio: '',
  favoriteGenres: [],
  website: '',
  instagram: '',
  twitter: '',
  avatar: null,
  coverImage: null,
};
