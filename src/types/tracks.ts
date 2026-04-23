import { z } from 'zod';

const DEFAULT_TRACK_IMAGE = '/images/default_song_image.png';

const trackImageWithDefault = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return DEFAULT_TRACK_IMAGE;
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return DEFAULT_TRACK_IMAGE;
  }

  return value;
}, z.string().trim().min(1));

const nullableStringWithDefault = (defaultValue: string) =>
  z.preprocess((value) => {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    if (typeof value === 'string' && value.trim().length === 0) {
      return defaultValue;
    }
    return value;
  }, z.string());
// ================================
// Track Upload
// ================================

/** DTO returned by POST /tracks/upload */
export const uploadTrackResponseSchema = z.object({
  id: z.number().int().nonnegative(),
  title: z.string().trim().min(1),
  trackSlug: z.string().trim().min(1).optional(),
  trackUrl: z.string().trim().min(1),
  trackPreviewUrl: z.string().trim().min(1).optional(),
  coverUrl: trackImageWithDefault,
  durationSeconds: z.number().int().nonnegative().optional(),
  access: z.enum(['PLAYABLE', 'BLOCKED', 'PREVIEW']).optional(),
});
export type UploadTrackResponse = z.infer<typeof uploadTrackResponseSchema>;

export const uploadTrackSessionStatusSchema = z.enum([
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
]);
export type UploadTrackSessionStatus = z.infer<
  typeof uploadTrackSessionStatusSchema
>;

export const uploadTrackSessionResponseSchema = z.object({
  uploadSessionId: z.string().trim().min(1),
  status: uploadTrackSessionStatusSchema,
});
export type UploadTrackSessionResponse = z.infer<
  typeof uploadTrackSessionResponseSchema
>;

export const uploadTrackAcceptedResponseSchema = z.union([
  uploadTrackSessionResponseSchema,
  uploadTrackResponseSchema,
]);
export type UploadTrackAcceptedResponse = z.infer<
  typeof uploadTrackAcceptedResponseSchema
>;

// ================================
// Track Visibility
// ================================

/** Schema for GET /tracks/:trackId — privacy state of a track */
export const trackVisibilitySchema = z.object({
  isPrivate: z.boolean(),
});
export type TrackVisibility = z.infer<typeof trackVisibilitySchema>;

/** Schema for PATCH /tracks/:trackId — update privacy setting */
export const updateTrackVisibilityDtoSchema = z.object({
  isPrivate: z.boolean(),
});
export type UpdateTrackVisibilityDto = z.infer<
  typeof updateTrackVisibilityDtoSchema
>;

/** Privacy value used in radio button UI */
export const trackPrivacyValueSchema = z.enum([
  'public',
  'private',
  'scheduled',
]);
export type TrackPrivacyValue = z.infer<typeof trackPrivacyValueSchema>;

// ================================
// Secret Link
// ================================

/** Schema for GET /tracks/:trackId/secret-token and POST /tracks/:trackId/generate-token */
export const secretTokenResponseSchema = z.object({
  secretToken: z.string().trim().min(1, 'Secret token cannot be empty'),
});
export type SecretTokenResponse = z.infer<typeof secretTokenResponseSchema>;

/** UI-level secret link token shape consumed by hooks/components */
export const secretLinkSchema = z.object({
  secretLink: z.string().min(1, 'Secret link token cannot be empty'),
});
export type SecretLink = z.infer<typeof secretLinkSchema>;

// ================================
// Track Metadata
// ================================

/** Artist info embedded in track metadata response */
export const trackArtistSchema = z
  .object({
    id: z.number().optional(),
    username: z.string().optional(),
    displayName: nullableStringWithDefault('').optional(),
    avatarUrl: z.string().url().optional().nullable(),
  })
  .passthrough();
export type TrackArtist = z.infer<typeof trackArtistSchema>;

/** Strict artist schema used by track metadata endpoint */
export const trackMetadataArtistSchema = z.object({
  id: z.number(),
  username: z.string(),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
});
export type TrackMetadataArtist = z.infer<typeof trackMetadataArtistSchema>;

/** Schema for GET /tracks/:trackId */
export const trackDetailsResponseSchema = z.object({
  id: z.number().int().nonnegative(),
  title: z.string().trim().min(1),
  trackSlug: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  durationSeconds: z.coerce.number().int().nonnegative().optional().nullable(),
  trackDurationSeconds: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .nullable(),
  genre: z.string().trim().optional().default('Unknown'),
  description: nullableStringWithDefault(' '),
  releaseDate: z.string().trim().optional().nullable(),
  isPrivate: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  trackUrl: z.string().trim().min(1).optional().nullable(),
  coverUrl: trackImageWithDefault,
  coverImage: trackImageWithDefault.optional(),
  waveformUrl: z.string().trim().min(1).optional().nullable(),
  waveformData: z.union([z.string(), z.array(z.number())]).optional(),
  artist: trackArtistSchema.partial().optional(),
  userId: z.number().int().nonnegative().optional(),
  username: z.string().trim().min(1).optional(),
  access: z.enum(['PLAYABLE', 'BLOCKED', 'PREVIEW']).optional(),
  isLiked: z.boolean().optional(),
  isReposted: z.boolean().optional(),
  likeCount: z.number().int().nonnegative().optional(),
  repostCount: z.number().int().nonnegative().optional(),
  playCount: z.number().int().nonnegative().optional(),
  uploadDate: z.string().trim().optional().nullable(),
});
export type TrackDetailsResponse = z.infer<typeof trackDetailsResponseSchema>;

export const paginatedTracksResponseSchema = z.object({
  content: z.array(trackDetailsResponseSchema),
  pageNumber: z.number().int().nonnegative(),
  pageSize: z.number().int().nonnegative(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  isLast: z.boolean(),
});
export type PaginatedTracksResponse = z.infer<typeof paginatedTracksResponseSchema>;
export type PaginatedTrackMetadataResponse = Omit<
  PaginatedTracksResponse,
  'content'
> & {
  content: TrackMetaData[];
};


/** Schema for PATCH /tracks/:trackId */
export const trackUpdateResponseSchema = z.object({
  id: z.number().int().nonnegative(),
  coverUrl: trackImageWithDefault,
  title: z.string().trim().min(1),
  trackSlug: z.string().trim().min(1).optional(),
  trackPreviewUrl: z.string().trim().min(1).optional(),
  genre: z.string().trim().min(1),
  description: nullableStringWithDefault(' '),
  isPrivate: z.boolean(),
  tags: z.array(z.string()),
  releaseDate: z.string().trim().min(1),
  commentCount: z.number().int().nonnegative().optional(),
  access: z.enum(['PLAYABLE', 'BLOCKED', 'PREVIEW']).optional(),
});
export type TrackUpdateResponse = z.infer<typeof trackUpdateResponseSchema>;

/** Schema for GET /users/me/tracks/:trackId — full track metadata */
export const trackMetadataSchema = z.object({
  id: z.number(),
  title: z.string(),
  trackSlug: z.string().trim().min(1).optional(),
  artist: trackMetadataArtistSchema,
  trackUrl: z.string().url(),
  durationSeconds: z.number().int().nonnegative().optional(),
  access: z.enum(['PLAYABLE', 'BLOCKED', 'PREVIEW']).optional(),
  coverUrl: trackImageWithDefault,
  waveformUrl: z.string().url(),
  waveformData: z.array(z.number()).optional(),
  genre: z.string(),
  tags: z.array(z.string()),
  description: nullableStringWithDefault(' '),
  releaseDate: z.string().optional().default(''),
  isLiked: z.boolean().optional(),
  isReposted: z.boolean().optional(),
  likeCount: z.number().int().nonnegative().optional(),
  repostCount: z.number().int().nonnegative().optional(),
  playCount: z.number().int().nonnegative().optional(),
  uploadDate: z.string().optional().default(''),
});
export type TrackMetaData = z.infer<typeof trackMetadataSchema>;

// ================================
// Track List / Feed Responses
// ================================

/** Schema for track card/list payloads returned by paginated track endpoints */
export const trackResponseSchema = z
  .object({
    artist: trackArtistSchema,
    coverUrl: trackImageWithDefault,
    description: nullableStringWithDefault(' '),
    genre: z.string(),
    id: z.number(),
    isLiked: z.boolean(),
    isReposted: z.boolean(),
    likeCount: z.number(),
    playCount: z.number(),
    releaseDate: z.coerce.date(),
    repostCount: z.number(),
    tags: z.array(z.string()).optional(),
    title: z.string(),
    trackUrl: z.string(),
    uploadDate: z.coerce.date().optional(),
    waveformUrl: z.string(),
  })
  .passthrough();
export type TrackResponse = z.infer<typeof trackResponseSchema>;

/** Generic paginated response used by Apidog docs for track lists */
export const paginatedTrackResponseSchema = z
  .object({
    content: z.array(trackResponseSchema).optional(),
    isLast: z.boolean().optional(),
    pageNumber: z.number().optional(),
    pageSize: z.number().optional(),
    totalElements: z.number().optional(),
    totalPages: z.number().optional(),
  })
  .passthrough();
export type paginatedTrackResponse = z.infer<
  typeof paginatedTrackResponseSchema
>;

// ================================
// Track Preview (UI only — not from API)
// ================================

/** Track metadata shown in ShareModal preview — subset of TrackMetadata */
export const trackPreviewSchema = z.object({
  title: z.string(),
  artist: z.string(),
  coverUrl: trackImageWithDefault,
  duration: z.string().optional().nullable(),
});
export type TrackPreview = z.infer<typeof trackPreviewSchema>;

// ================================
// FullTrackDTO (Discovery/Feed)
// ================================

export const fullTrackSchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
    trackSlug: z.string().trim().min(1),
    artist: z.object({
      id: z.number().int().nonnegative(),
      username: z.string().trim().min(1),
      displayName: z.string().trim().min(1),
      avatarUrl: z.string().url(),
      isFollowing: z.boolean(),
      followerCount: z.number().int().nonnegative(),
      trackCount: z.number().int().nonnegative(),
    }),
    trackUrl: z.string().url(),
    coverUrl: z.string().url(),
    waveformUrl: z.string().url(),
    genre: z.string().trim().min(1),
    isReposted: z.boolean(),
    isLiked: z.boolean(),
    tags: z.array(z.string()),
    releaseDate: z.string().trim().min(1),
    playCount: z.number().int().nonnegative(),
    CompletedPlayCount: z.number().int().nonnegative(),
    likeCount: z.number().int().nonnegative(),
    repostCount: z.number().int().nonnegative(),
    commentCount: z.number().int().nonnegative(),
    isPrivate: z.boolean(),
    trackDurationSeconds: z.number().int().nonnegative(),
    uploadDate: z.string().trim().min(1),
    description: z.string(),
    trendingRank: z.number().int().nonnegative(),
    access: z.enum(['BLOCKED', 'PREVIEW', 'PLAYABLE']),
    secretToken: z.string().trim().min(1),
    trackPreviewUrl: z.string().url(),
  })
  .passthrough();
export type FullTrackDTO = z.infer<typeof fullTrackSchema>;

// ================================
// TrackSummaryDTO
// ================================

export const trackAccessSchema = z.enum(['BLOCKED', 'PREVIEW', 'PLAYABLE']);

export const trackSummarySchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
    trackSlug: z.string().trim().min(1),
    coverUrl: z.string().url(),
    trackUrl: z.string().url(),
    trackPreviewUrl: z.string().url(),
    artist: z.object({
      id: z.number().int().nonnegative(),
      username: z.string().trim().min(1),
      displayName: z.string().trim().min(1),
      avatarUrl: z.string().url(),
      isFollowing: z.boolean(),
      followerCount: z.number().int().nonnegative(),
      trackCount: z.number().int().nonnegative(),
    }),
    playCount: z.number().int().nonnegative(),
    likeCount: z.number().int().nonnegative(),
    repostCount: z.number().int().nonnegative(),
    commentCount: z.number().int().nonnegative(),
    isLiked: z.boolean(),
    isReposted: z.boolean(),
    secretToken: z.string().trim().min(1),
    access: trackAccessSchema,
  })
  .passthrough();
export type TrackSummaryDTO = z.infer<typeof trackSummarySchema>;

export const trackResourceRefSchema = z
  .object({
    resourceType: z.literal('TRACK'),
    resourceId: z.number().int().nonnegative(),
  })
  .passthrough();
export type TrackResourceRefDTO = z.infer<typeof trackResourceRefSchema>;

/**
 * RepostUser
 */
export const repostUserSchema = z
  .object({
    avatarUrl: z.string().optional(),
    id: z.number().optional(),
    isFollowing: z.boolean().optional(),
    tier: z.string().optional(),
    username: z.string().optional(),
  })
  .passthrough();
export type RepostUser = z.infer<typeof repostUserSchema>;

/**
 * RepostUsersReponse
 */
export const paginationRepostUserSchema = z
  .object({
    content: z.array(repostUserSchema).optional(),
    isLast: z.boolean().optional(),
    pageNumber: z.number().optional(),
    pageSize: z.number().optional(),
    totalElements: z.number().optional(),
    totalPages: z.number().optional(),
  })
  .passthrough();
export type paginationRepostUser = z.infer<typeof paginationRepostUserSchema>;

/**
 * LikeResponse
 */
export const likeResponseSchema = z
  .object({
    isLiked: z.boolean(),
    message: z.string(),
  })
  .passthrough();
export type likeResponse = z.infer<typeof likeResponseSchema>;

/**
 * RepostResponse
 */
export const repostResponseSchema = z
  .object({
    isReposted: z.boolean(),
    message: z.string(),
  })
  .passthrough();
export type repostResponse = z.infer<typeof repostResponseSchema>;
