import { z } from 'zod';

import { privacySettingsSchema } from './privacy';

export const DEFAULT_PROFILE_AVATAR_IMAGE = '/images/default_song_image.png';
export const DEFAULT_PROFILE_COVER_IMAGE = '/images/default_song_image.png';

export const imageWithDefault = (defaultValue: string) =>
  z.preprocess((value) => {
    if (value === null || value === undefined) {
      return defaultValue;
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return defaultValue;
    }

    return value;
  }, z.string());
export const nullableStringWithDefault = (defaultValue: string) =>
  z.preprocess((value) => {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return value;
  }, z.string().nullable().optional());
const userTierSchema = z.enum([
  'FREE',
  'ARTIST',
  'ARTIST_PRO',
  'LISTENER',
  'OTHER',
]);

const userProfileSchema = z.object({
  displayName: nullableStringWithDefault(''),
  bio: z.string(),
  city: z.string(),
  country: z.string(),
  profilePic: imageWithDefault(DEFAULT_PROFILE_AVATAR_IMAGE),
  coverPic: imageWithDefault(DEFAULT_PROFILE_COVER_IMAGE),
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

const userMeLegacySchema = z
  .object({
    id: z.number().int().nonnegative(),
    email: z.string().trim().email(),
    username: z.string().trim().min(1),
    displayName: nullableStringWithDefault('').optional(),
    isBlocked: z.boolean(),
    tier: userTierSchema,
    profile: userProfileSchema,
    socialLinks: userSocialLinksSchema,
    privacySettings: privacySettingsSchema,
    stats: userStatsSchema,
  })
  .passthrough();

const publicSocialLinksItemSchema = z.object({
  instagram: z.string().nullable(),
  twitter: z.string().nullable(),
  website: z.string().nullable(),
});

const userPublicProfileSchema = z.object({
  id: z.number().int().nonnegative(),
  email: z.string().trim().email(),
  username: z.string().trim().min(1),
  displayName: nullableStringWithDefault(''),
  tier: userTierSchema,
  followerCount: z.number().int().nonnegative(),
  followingCount: z.number().int().nonnegative(),
  trackCount: z.number().int().nonnegative(),
  isFollowed: z.boolean(),
  isFollowing: z.boolean(),
  isBlocked: z.boolean(),
  bio: nullableStringWithDefault(''),
  city: nullableStringWithDefault(''),
  country: nullableStringWithDefault(''),
  profilePic: imageWithDefault(DEFAULT_PROFILE_AVATAR_IMAGE),
  coverPic: imageWithDefault(DEFAULT_PROFILE_COVER_IMAGE),
  favoriteGenres: z.array(z.string()),
  socialLinksDto: z.array(publicSocialLinksItemSchema),
});

const userMeApiProfileSchema = z
  .object({
    profile: userPublicProfileSchema,
    privacySettings: privacySettingsSchema,
  })
  .passthrough();

type UserMeNormalized = z.infer<typeof userMeLegacySchema>;

/** DTO returned by GET /users/me */
export const userMeSchema = z
  .union([userMeLegacySchema, userMeApiProfileSchema])
  .transform((payload): UserMeNormalized => {
    if ('id' in payload) {
      const legacy = payload as z.infer<typeof userMeLegacySchema>;
      const legacyDisplayName =
        legacy.displayName ?? legacy.profile.displayName ?? null;

      return {
        id: legacy.id,
        email: legacy.email,
        username: legacy.username,
        displayName: legacyDisplayName,
        isBlocked: legacy.isBlocked,
        tier: legacy.tier,
        profile: {
          displayName: legacyDisplayName,
          bio: legacy.profile.bio ?? '',
          city: legacy.profile.city ?? '',
          country: legacy.profile.country ?? '',
          profilePic: legacy.profile.profilePic,
          coverPic: legacy.profile.coverPic,
          favoriteGenres: legacy.profile.favoriteGenres,
        },
        socialLinks: {
          instagram: legacy.socialLinks.instagram ?? '',
          twitter: legacy.socialLinks.twitter ?? '',
          website: legacy.socialLinks.website ?? '',
          supportLink: legacy.socialLinks.supportLink ?? '',
        },
        privacySettings: legacy.privacySettings,
        stats: legacy.stats,
      };
    }

    const modern = payload as z.infer<typeof userMeApiProfileSchema>;
    const profile = modern.profile;
    const socialLinksDto = profile.socialLinksDto[0];

    return {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      displayName: profile.displayName ?? null,
      isBlocked: profile.isBlocked,
      tier: profile.tier,
      profile: {
        displayName: profile.displayName ?? null,
        bio: profile.bio ?? '',
        city: profile.city ?? '',
        country: profile.country ?? '',
        profilePic: profile.profilePic,
        coverPic: profile.coverPic,
        favoriteGenres: profile.favoriteGenres,
      },
      socialLinks: {
        instagram: socialLinksDto?.instagram ?? '',
        twitter: socialLinksDto?.twitter ?? '',
        website: socialLinksDto?.website ?? '',
        supportLink: '',
      },
      privacySettings: modern.privacySettings,
      stats: {
        followers: profile.followerCount,
        following: profile.followingCount,
        tracksCount: profile.trackCount,
      },
    };
  });
export type UserMe = z.infer<typeof userMeSchema>;

/** DTO returned by GET /users/{userId} */
export const userPublicSchema = z
  .object({
    profile: userPublicProfileSchema,
    privacySettings: privacySettingsSchema.nullable(),
  })
  .passthrough();
export type UserPublic = z.infer<typeof userPublicSchema>;

// ================================
// UserSummaryDTO
// ================================

export const userSummarySchema = z
  .object({
    id: z.number().int().nonnegative(),
    username: z.string().trim().min(1),
    displayName: z.string().trim().min(1).nullable(),
    avatarUrl: z.string().url().nullable(),
    isFollowing: z.boolean().optional().default(false),
    followerCount: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .default(99999999999),
    trackCount: z.number().int().nonnegative().optional().default(99999999999),
  })
  .passthrough();
export type UserSummaryDTO = z.infer<typeof userSummarySchema>;

// ================================
// User API DTOs
// ================================

export const messageResponseSchema = z
  .object({
    message: z.string().min(1),
  })
  .passthrough();
export type MessageResponse = z.infer<typeof messageResponseSchema>;

export const privateSocialLinksSchema = z
  .object({
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
    supportLink: z.string().url().optional(),
  })
  .passthrough();
export type PrivateSocialLinks = z.infer<typeof privateSocialLinksSchema>;

export const updateSocialLinksRequestSchema = privateSocialLinksSchema
  .partial()
  .refine(
    (payload) => Object.values(payload).some((value) => value !== undefined),
    {
      message: 'At least one social link must be provided.',
    }
  );
export type UpdateSocialLinksRequest = z.infer<
  typeof updateSocialLinksRequestSchema
>;

export const updateRoleRequestSchema = z.object({
  newRole: z.enum(['LISTENER', 'ARTIST']),
});
export type UpdateRoleRequest = z.infer<typeof updateRoleRequestSchema>;

export const updateTierRequestSchema = z.object({
  newTier: z.enum(['FREE', 'ARTIST', 'ARTIST_PRO']),
});
export type UpdateTierRequest = z.infer<typeof updateTierRequestSchema>;

export const updateTierResponseSchema = z
  .object({
    tier: z.enum(['FREE', 'ARTIST', 'ARTIST_PRO']),
    login: z.unknown().optional(),
  })
  .passthrough();
export type UpdateTierResponse = z.infer<typeof updateTierResponseSchema>;

export const updateImagesJsonRequestSchema = z
  .object({
    profilePic: z.string().url().optional(),
    coverPic: z.string().url().optional(),
  })
  .refine(
    (payload) =>
      payload.profilePic !== undefined || payload.coverPic !== undefined,
    { message: 'At least one image URL must be provided.' }
  );
export type UpdateImagesJsonRequest = z.infer<
  typeof updateImagesJsonRequestSchema
>;

export const updateImagesResponseSchema = z
  .object({
    profilePic: z.string().url().optional(),
    coverPic: z.string().url().optional(),
  })
  .passthrough();
export type UpdateImagesResponse = z.infer<typeof updateImagesResponseSchema>;

export const resetLoggedInPasswordRequestSchema = z.object({
  newPassword: z.string().min(1),
});
export type ResetLoggedInPasswordRequest = z.infer<
  typeof resetLoggedInPasswordRequestSchema
>;

export const addNewEmailRequestSchema = z.object({
  newEmail: z.string().email(),
});
export type AddNewEmailRequest = z.infer<typeof addNewEmailRequestSchema>;

export const updatePrimaryEmailRequestSchema = z.object({
  newEmail: z.string().email(),
});
export type UpdatePrimaryEmailRequest = z.infer<
  typeof updatePrimaryEmailRequestSchema
>;

export const followResponseSchema = z
  .object({
    message: z.string().min(1),
    isFollowing: z.boolean(),
  })
  .passthrough();
export type FollowResponse = z.infer<typeof followResponseSchema>;

export const searchUserSchema = z
  .object({
    id: z.number().int().nonnegative().optional(),
    username: z.string().trim().min(1).optional(),
    displayName: z.string().trim().min(1).optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    tier: z.string().optional(),
    isFollowing: z.boolean().optional(),
  })
  .passthrough();
export type SearchUser = z.infer<typeof searchUserSchema>;

/**
 * FollowerUser
 */
export const followerUserSchema = z
  .object({
    avatarUrl: z.string().optional(),
    id: z.number().int().nonnegative().optional(),
    isFollowing: z.boolean().optional(),
    tier: z.string().optional(),
    username: z.string().optional(),
  })
  .passthrough();
export type FollowerUser = z.infer<typeof followerUserSchema>;

export const searchPlaylistSchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
  })
  .passthrough();
export type SearchPlaylist = z.infer<typeof searchPlaylistSchema>;

export const listeningHistoryItemSchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().optional(),
  })
  .passthrough();
export type ListeningHistoryItem = z.infer<typeof listeningHistoryItemSchema>;

const paginationInfoSchema = z
  .object({
    pageNumber: z.number().int().nonnegative().optional(),
    pageSize: z.number().int().positive().optional(),
    number: z.number().int().nonnegative().optional(),
    size: z.number().int().positive().optional(),
    totalElements: z.number().int().nonnegative().optional(),
    totalPages: z.number().int().nonnegative().optional(),
    isLast: z.boolean().optional(),
    last: z.boolean().optional(),
  })
  .passthrough();

export const paginatedFollowersResponseSchema = paginationInfoSchema.extend({
  content: z.array(searchUserSchema),
});
export type PaginatedFollowersResponse = z.infer<
  typeof paginatedFollowersResponseSchema
>;

export const paginatedHistoryResponseSchema = paginationInfoSchema.extend({
  content: z.array(listeningHistoryItemSchema),
});
export type PaginatedHistoryResponse = z.infer<
  typeof paginatedHistoryResponseSchema
>;

export const paginatedTracksResponseSchema = paginationInfoSchema.extend({
  content: z.array(listeningHistoryItemSchema),
});
export type PaginatedTracksResponse = z.infer<
  typeof paginatedTracksResponseSchema
>;

export const usersSuggestedResponseSchema = z
  .union([
    z.array(searchUserSchema),
    z
      .object({
        content: z.array(searchUserSchema),
      })
      .passthrough(),
  ])
  .transform((payload) => (Array.isArray(payload) ? payload : payload.content));
export type UsersSuggestedResponse = z.infer<
  typeof usersSuggestedResponseSchema
>;

export const userPlaylistsResponseSchema = z.array(searchPlaylistSchema);
export type UserPlaylistsResponse = z.infer<typeof userPlaylistsResponseSchema>;

/**
 * UpdateMeRequest
 */

const userEditedSocialLinksSchema = z.object({
  instagram: z.string().url().optional(),
  twitter: z.string().url().optional(),
  website: z.string().url().optional(),
});

export const updateMeRequestSchema = z
  .object({
    bio: z.string().optional(),
    city: z.string().optional(),
    displayName: z.string().trim().min(2),
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
