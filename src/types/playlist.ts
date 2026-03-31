import { z } from 'zod';

export const playlistOwnerSchema = z
  .object({
    id: z.number().optional(),
    username: z.string().optional(),
  })
  .passthrough();
export type PlaylistOwner = z.infer<typeof playlistOwnerSchema>;

export const playlistTrackSchema = z
  .object({
    durationSeconds: z.number().optional(),
    title: z.string().optional(),
    trackId: z.number().optional(),
    trackUrl: z.string().optional(),
  })
  .passthrough();
export type PlaylistTrack = z.infer<typeof playlistTrackSchema>;

/**
 * PlaylistType
 */
export enum PlaylistType {
  Album = 'ALBUM',
  Ep = 'EP',
  Playlist = 'PLAYLIST',
  Single = 'SINGLE',
}
/**
 * PlaylistResponse
 */
export const playlistResponseSchema = z
  .object({
    id: z.number().optional(),
    isLiked: z.boolean(),
    owner: playlistOwnerSchema.optional(),
    title: z.string().optional(),
    tracks: z.array(playlistTrackSchema).optional(),
    type: z.nativeEnum(PlaylistType).optional(),
  })
  .passthrough();
export type PlaylistResponse = z.infer<typeof playlistResponseSchema>;

export const paginatedPlaylistResponseSchema = z
  .object({
    content: z.array(playlistResponseSchema).optional(),
    isLast: z.boolean().optional(),
    pageNumber: z.number().optional(),
    pageSize: z.number().optional(),
    totalElements: z.number().optional(),
    totalPages: z.number().optional(),
  })
  .passthrough();
export type paginatedPlaylistResponse = z.infer<
  typeof paginatedPlaylistResponseSchema
>;
