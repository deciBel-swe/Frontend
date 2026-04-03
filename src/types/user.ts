import { z } from 'zod';

import { privacySettingsSchema } from './privacy';

const DEFAULT_PROFILE_AVATAR_IMAGE = '/images/default_song_image.png';
const DEFAULT_PROFILE_COVER_IMAGE = '/images/default_song_image.png';

const imageWithDefault = (defaultValue: string) =>
  z.preprocess((value) => {
    if (value === null || value === undefined) {
      return defaultValue;
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return defaultValue;
    }

    return value;
  }, z.string());

const userTierSchema = z.enum([
  'FREE',
  'ARTIST',
  'ARTIST_PRO',
  'LISTENER',
  'OTHER',
]);

const userProfileSchema = z.object({
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

/** DTO returned by GET /users/me */
export const userMeSchema = z
  .object({
    id: z.number().int().nonnegative(),
    email: z.string().trim().email(),
    username: z.string().trim().min(1),
    isBlocked: z.boolean(),
    tier: userTierSchema,
    profile: userProfileSchema,
    socialLinks: userSocialLinksSchema,
    privacySettings: privacySettingsSchema,
    stats: userStatsSchema,
  })
  .passthrough();
export type UserMe = z.infer<typeof userMeSchema>;

const publicSocialLinksItemSchema = z.object({
  instagram: z.string().nullable(),
  twitter: z.string().nullable(),
  website: z.string().nullable(),
});

const userPublicProfileSchema = z.object({
  id: z.number().int().nonnegative(),
  email: z.string().trim().email(),
  username: z.string().trim().min(1),
  tier: userTierSchema,
  followerCount: z.number().int().nonnegative(),
  followingCount: z.number().int().nonnegative(),
  trackCount: z.number().int().nonnegative(),
  isFollowed: z.boolean(),
  isFollowing: z.boolean(),
  isBlocked: z.boolean(),
  bio: z.string(),
  city: z.string(),
  country: z.string().nullable(),
  profilePic: imageWithDefault(DEFAULT_PROFILE_AVATAR_IMAGE),
  coverPic: imageWithDefault(DEFAULT_PROFILE_COVER_IMAGE),
  favoriteGenres: z.array(z.string()),
  socialLinksDto: z.array(publicSocialLinksItemSchema),
});

/** DTO returned by GET /users/{userId} */
export const userPublicSchema = z
  .object({
    profile: userPublicProfileSchema,
    privacySettings: privacySettingsSchema.nullable(),
  })
  .passthrough();
export type UserPublic = z.infer<typeof userPublicSchema>;

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
    id: z.number().int().nonnegative(),
    username: z.string().trim().min(1),
    avatarUrl: z.string().url().optional(),
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
    totalElements: z.number().int().nonnegative().optional(),
    totalPages: z.number().int().nonnegative().optional(),
    isLast: z.boolean(),
  })
  .passthrough();

export const paginatedFollowersResponseSchema = paginationInfoSchema.extend({
  content: z.array(searchUserSchema),
});
export type PaginatedFollowersResponse = z.infer<
  typeof paginatedFollowersResponseSchema
>;

export const paginatedFeedResponseSchema = paginationInfoSchema.extend({
  content: z.array(listeningHistoryItemSchema),
});
export type PaginatedFeedResponse = z.infer<typeof paginatedFeedResponseSchema>;

export const paginatedTracksResponseSchema = paginationInfoSchema.extend({
  content: z.array(listeningHistoryItemSchema),
});
export type PaginatedTracksResponse = z.infer<
  typeof paginatedTracksResponseSchema
>;

export const usersSuggestedResponseSchema = z.array(searchUserSchema);
export type UsersSuggestedResponse = z.infer<
  typeof usersSuggestedResponseSchema
>;

export const userPlaylistsResponseSchema = z.array(searchPlaylistSchema);
export type UserPlaylistsResponse = z.infer<typeof userPlaylistsResponseSchema>;

/**
 * UpdateMeRequest
 */

const userEditedSocialLinksSchema = z.object({
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional(),
  supportLink: z.string().optional(),
});
export const updateMeRequestSchema = z
  .object({
    bio: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    favoriteGenres: z.array(z.string()).optional(),
    socialLinks: userEditedSocialLinksSchema.optional(),
  })
  .passthrough();
export type UpdateMeRequest = z.infer<typeof updateMeRequestSchema>;

export type ProfileLink = {
  id: number;
  url: string;
  title: string;
  kind: 'regular' | 'support';
};
