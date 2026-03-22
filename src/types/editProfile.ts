import { z } from 'zod';
import type { ProfileLink, UpdateMeRequest } from './user';

export type EditProfileFormValues = {
  displayName: string;
  profileUrl: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  bio: string;
  links: ProfileLink[];
  avatar: File | string | null;
};

export type EditProfileFormErrorKey =
  | 'displayName'
  | 'profileUrl'
  | 'firstName'
  | 'lastName'
  | 'city'
  | 'country'
  | 'bio'
  | 'links'
  | 'avatar';

export type EditProfileFormErrors = Partial<
  Record<EditProfileFormErrorKey, string>
>;

export const MAX_PROFILE_LINKS = 10;

const linkSchema = z
  .object({
    id: z.number().int().positive(),
    url: z.string().trim().max(2048, 'Link URL is too long'),
    title: z.string().trim().max(80, 'Link title is too long'),
    kind: z.enum(['regular', 'support']),
  })
  .superRefine((value, ctx) => {
    const hasUrl = value.url.length > 0;
    const hasTitle = value.title.length > 0;

    if (value.kind === 'regular' && hasTitle && !hasUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['url'],
        message: 'A URL is required when link title is provided.',
      });
    }

    if (value.kind === 'support' && !hasUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['url'],
        message: 'Support link URL is required.',
      });
    }
  });

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
    profileUrl: z
      .string()
      .trim()
      .min(3, 'Profile URL is required')
      .max(30, 'Profile URL must be 30 characters or fewer')
      .regex(
        /^[a-z0-9._-]+$/,
        'Profile URL can only contain lowercase letters, numbers, dot, underscore, and hyphen'
      ),
    firstName: z
      .string()
      .trim()
      .max(40, 'First name must be 40 characters or fewer'),
    lastName: z
      .string()
      .trim()
      .max(40, 'Last name must be 40 characters or fewer'),
    city: z.string().trim().max(80, 'City must be 80 characters or fewer'),
    country: z
      .string()
      .trim()
      .max(60, 'Country must be 60 characters or fewer'),
    bio: z.string().trim().max(200, 'Bio must be 200 characters or fewer'),
    links: z
      .array(linkSchema)
      .max(MAX_PROFILE_LINKS, `Maximum ${MAX_PROFILE_LINKS} links allowed`),
    avatar: avatarSchema,
  })
  .superRefine((values, ctx) => {
    const supportLinkCount = values.links.filter(
      (link) => link.kind === 'support'
    ).length;

    if (supportLinkCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['links'],
        message: 'Only one support link is allowed.',
      });
    }
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
        pathKey === 'profileUrl' ||
        pathKey === 'firstName' ||
        pathKey === 'lastName' ||
        pathKey === 'city' ||
        pathKey === 'country' ||
        pathKey === 'bio' ||
        pathKey === 'links' ||
        pathKey === 'avatar') &&
      !errors[pathKey]
    ) {
      errors[pathKey] = issue.message;
    }
  }

  return errors;
};

export const buildSocialLinksFromProfileLinks = (
  links: ProfileLink[]
): UpdateMeRequest['socialLinks'] => {
  const socialLinks: UpdateMeRequest['socialLinks'] = {};

  for (const link of links) {
    const url = link.url.trim();
    if (!url) {
      continue;
    }

    if (link.kind === 'support') {
      socialLinks.supportLink = url;
      continue;
    }

    let normalizedHost = '';
    try {
      const parsed = new URL(url);
      normalizedHost = parsed.hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      normalizedHost = '';
    }

    if (
      !socialLinks.instagram &&
      (normalizedHost === 'instagram.com' ||
        normalizedHost.endsWith('.instagram.com'))
    ) {
      socialLinks.instagram = url;
      continue;
    }

    if (
      !socialLinks.twitter &&
      (normalizedHost === 'twitter.com' ||
        normalizedHost.endsWith('.twitter.com') ||
        normalizedHost === 'x.com' ||
        normalizedHost.endsWith('.x.com'))
    ) {
      socialLinks.twitter = url;
      continue;
    }

    const title = link.title.trim().toLowerCase();

    if (!socialLinks.instagram && title.includes('instagram')) {
      socialLinks.instagram = url;
      continue;
    }

    if (!socialLinks.twitter && (title.includes('twitter') || title === 'x')) {
      socialLinks.twitter = url;
      continue;
    }

    if (!socialLinks.website) {
      socialLinks.website = url;
    }
  }

  return socialLinks;
};

export const emptyEditProfileFormValues: EditProfileFormValues = {
  displayName: '',
  profileUrl: '',
  firstName: '',
  lastName: '',
  city: '',
  country: '',
  bio: '',
  links: [],
  avatar: null,
};
