import { z } from 'zod';

// ================================
// Track Upload
// ================================

/** DTO returned by POST /tracks/upload */
export const uploadTrackResponseSchema = z.object({
  id: z.number().int().nonnegative(),
  title: z.string().trim().min(1),
  trackUrl: z.string().trim().min(1),
  coverUrl: z.string().trim().min(1),
  durationSeconds: z.number().int().nonnegative(),
});
export type UploadTrackResponse = z.infer<typeof uploadTrackResponseSchema>;

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
export const trackArtistSchema = z.object({
  id: z.number(),
  username: z.string(),
});
export type TrackArtist = z.infer<typeof trackArtistSchema>;

/** Schema for GET /tracks/:trackId */
export const trackDetailsResponseSchema = z.object({
  id: z.number().int().nonnegative(),
  title: z.string().trim().min(1),
  genre: z.string().trim().optional().default('Unknown'),
  description: z.string().optional().default('').nullable(),
  releaseDate: z.string().trim().optional().nullable(),
  isPrivate: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  trackUrl: z.string().trim().min(1).optional().nullable(),
  coverUrl: z.string().trim().min(1).optional().nullable(),
  coverImage: z.string().trim().min(1).optional().nullable(),
  waveformUrl: z.string().trim().min(1).optional().nullable(),
  waveformData: z.union([z.string(), z.array(z.number())]).optional(),
  artist: trackArtistSchema.partial().optional(),
  userId: z.number().int().nonnegative().optional(),
  username: z.string().trim().min(1).optional(),
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


/** Schema for PATCH /tracks/:trackId */
export const trackUpdateResponseSchema = z.object({
  id: z.number().int().nonnegative(),
  coverUrl: z.string().trim().min(1),
  title: z.string().trim().min(1),
  genre: z.string().trim().min(1),
  description: z.string(),
  isPrivate: z.boolean(),
  tags: z.array(z.string()),
  releaseDate: z.string().trim().min(1),
});
export type TrackUpdateResponse = z.infer<typeof trackUpdateResponseSchema>;

/** Schema for GET /users/me/tracks/:trackId — full track metadata */
export const trackMetadataSchema = z.object({
  id: z.number(),
  title: z.string(),
  artist: trackArtistSchema,
  trackUrl: z.string().url(),
  coverUrl: z.string().url(),
  waveformUrl: z.string().url(),
  waveformData: z.array(z.number()).optional(),
  genre: z.string(),
  tags: z.array(z.string()),
  description: z.string().optional().default(''),
  releaseDate: z.string().optional().default(''),
});
export type TrackMetaData = z.infer<typeof trackMetadataSchema>;

// ================================
// Track Preview (UI only — not from API)
// ================================

/** Track metadata shown in ShareModal preview — subset of TrackMetadata */
export const trackPreviewSchema = z.object({
  title: z.string(),
  artist: z.string(),
  coverUrl: z.string().url().optional().nullable(),
  duration: z.string().optional().nullable(),
});
export type TrackPreview = z.infer<typeof trackPreviewSchema>;
