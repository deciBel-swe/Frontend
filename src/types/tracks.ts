import { z } from 'zod';

// ================================
// Track Visibility
// ================================

/** Schema for GET /tracks/:trackId — privacy state of a track */
export const trackVisibilitySchema = z.object({
  isPrivate: z.boolean(),
});
export type TrackVisibility = z.infer<typeof trackVisibilitySchema>;

/** Schema for PUT /tracks/:trackId — update privacy setting */
export const updateTrackVisibilityDtoSchema = z.object({
  isPrivate: z.boolean(),
});
export type UpdateTrackVisibilityDto = z.infer<typeof updateTrackVisibilityDtoSchema>;

/** Privacy value used in radio button UI */
export const trackPrivacyValueSchema = z.enum(['public', 'private', 'scheduled']);
export type TrackPrivacyValue = z.infer<typeof trackPrivacyValueSchema>;

// ================================
// Secret Link
// ================================

/** Schema for GET /tracks/:trackId/secret-link and GET /tracks/:trackId/regenerate-link */
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

/** Schema for GET /users/me/tracks/:trackId — full track metadata */
export const trackMetadataSchema = z.object({
  id: z.number(),
  title: z.string(),
  artist: trackArtistSchema,
  trackUrl: z.string().url(),
  coverUrl: z.string().url(),
  waveformUrl: z.string().url(),
  genre: z.string(),
  tags: z.array(z.string()),
});
export type TrackMetaData = z.infer<typeof trackMetadataSchema>;

// ================================
// Track Preview (UI only — not from API)
// ================================

/** Track metadata shown in ShareModal preview — subset of TrackMetadata */
export const trackPreviewSchema = z.object({
  title: z.string(),
  artist: z.string(),
  coverUrl: z.string().url().optional(),
  duration: z.string().optional(),
});
export type TrackPreview = z.infer<typeof trackPreviewSchema>;