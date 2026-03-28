import { z } from 'zod';

// ================================
// Playlist Create
// ================================

export const playlistTypeSchema = z.enum([
  'PLAYLIST',
  'ALBUM',
  'SINGLE',
  'EP',
]);
export type PlaylistType = z.infer<typeof playlistTypeSchema>;

/** DTO sent to POST /playlists */
export const createPlaylistRequestSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  type: playlistTypeSchema,
  isPrivate: z.boolean(),
  CoverArt: z.string().optional(),
});
export type CreatePlaylistRequest = z.infer<
  typeof createPlaylistRequestSchema
>;

export const playlistOwnerSchema = z.object({
  id: z.number().int(),
  username: z.string(),
});
export type PlaylistOwner = z.infer<typeof playlistOwnerSchema>;

export const playlistTrackSchema = z.object({
  trackId: z.number().int(),
  title: z.string(),
  durationSeconds: z.number().int(),
  trackUrl: z.string().url(),
});
export type PlaylistTrack = z.infer<typeof playlistTrackSchema>;

/** DTO returned by POST /playlists */
export const playlistResponseSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    type: playlistTypeSchema,
    isLiked: z.boolean(),
    owner: playlistOwnerSchema.optional(),
    tracks: z.array(playlistTrackSchema).optional(),
  })
  .passthrough();
export type PlaylistResponse = z.infer<typeof playlistResponseSchema>;

// ================================
// Playlist Update
// ================================

/** DTO sent to PATCH /playlists/:playlistId */
export const updatePlaylistRequestSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  type: playlistTypeSchema,
  isPrivate: z.boolean(),
  CoverArt: z.string().optional(),
});
export type UpdatePlaylistRequest = z.infer<
  typeof updatePlaylistRequestSchema
>;

/** DTO returned by PATCH /playlists/:playlistId */
export const playlistUpdateResponseSchema = z
  .object({
    id: z.number().int().optional(),
    title: z.string().optional(),
    type: playlistTypeSchema.optional(),
    isLiked: z.boolean(),
    owner: playlistOwnerSchema.optional(),
    tracks: z.array(playlistTrackSchema).optional(),
  })
  .passthrough();
export type PlaylistUpdateResponse = z.infer<
  typeof playlistUpdateResponseSchema
>;
