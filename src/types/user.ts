import { z } from 'zod';

import { privacySettingsSchema } from './privacy';

const userRoleSchema = z.enum(['LISTENER', 'ARTIST', 'OTHER']);
const userTierSchema = z.enum(['ARTIST', 'LISTENER', 'OTHER']);

const userProfileSchema = z.object({
  bio: z.string(),
  city: z.string(),
  country: z.string(),
  profilePic: z.string(),
  coverPic: z.string(),
  favoriteGenres: z.array(z.string()),
});

const userSocialLinksSchema = z.object({
  instagram: z.string(),
  website: z.string(),
  supportLink: z.string(),
  twitter: z.string(),
});

const userStatsSchema = z.object({
  followers: z.number().int().nonnegative(),
  following: z.number().int().nonnegative(),
  tracksCount: z.number().int().nonnegative(),
});

/** DTO returned by GET /users/me */
export const userMeSchema = z.object({
  id: z.number().int().nonnegative(),
  Role: userRoleSchema,
  email: z.string().trim().email(),
  username: z.string().trim().min(1),
  emailVerified: z.boolean(),
  tier: userTierSchema,
  profile: userProfileSchema,
  socialLinks: userSocialLinksSchema,
  privacySettings: privacySettingsSchema,
  stats: userStatsSchema,
});
export type UserMe = z.infer<typeof userMeSchema>;

const userPublicProfileSchema = z.object({
  username: z.string(),
  id: z.number().int().nonnegative(),
  bio: z.string(),
  location: z.string(),
  avatarUrl: z.string(),
  coverPhotoUrl: z.string(),
  favoriteGenres: z.array(z.string()),
});

const userPublicSocialLinksSchema = z.object({
  instagram: z.string(),
  twitter: z.string(),
  website: z.string(),
});

const userPublicStatsSchema = z.object({
  followersCount: z.number().int().nonnegative(),
  followingCount: z.number().int().nonnegative(),
  trackCount: z.number().int().nonnegative(),
});

/** DTO returned by GET /users/{userId} */
export const userPublicSchema = z.object({
  id: z.number().int().nonnegative(),
  username: z.string().trim().min(1),
  tier: userTierSchema,
  profile: userPublicProfileSchema,
  socialLinks: userPublicSocialLinksSchema,
  stats: userPublicStatsSchema,
});
export type UserPublic = z.infer<typeof userPublicSchema>;

/**
 * UpdateMeRequest
 */

const userEditedSocialLinksSchema = z.object({
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional(),
});
export const updateMeRequestSchema = z
  .object({
    bio: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    favoriteGenres: z.array(z.string()).optional(),
    socialLinks: userEditedSocialLinksSchema,
  })
  .passthrough();
export type UpdateMeRequest = z.infer<typeof updateMeRequestSchema>;

export type ProfileLink = {
  id: number;
  url: string;
  title: string;
  kind: 'regular' | 'support';
};
