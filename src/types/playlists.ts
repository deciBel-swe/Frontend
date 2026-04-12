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

// ================================
// Playlist Embed
// ================================

/** DTO returned by GET /playlists/:playlistId/embed */
export const playlistEmbedResponseSchema = z
  .object({
    embedCode: z.string().optional(),
  })
  .passthrough();
export type PlaylistEmbedResponse = z.infer<
  typeof playlistEmbedResponseSchema
>;

// ================================
// Playlist Secret Link
// ================================

/** DTO returned by GET /playlists/:playlistId/secret-link */
export const playlistSecretLinkResponseSchema = z
  .object({
    SecretLink: z.string().trim().min(1),
  })
  .passthrough();
export type PlaylistSecretLinkResponse = z.infer<
  typeof playlistSecretLinkResponseSchema
>;

/** DTO returned by POST /playlists/:playlistId/secret-link/regenerate */
export const playlistSecretLinkRegenerateResponseSchema = z
  .object({
    secretUrl: z.string().trim().min(1),
    expiresAt: z.string().trim().min(1),
  })
  .passthrough();
export type PlaylistSecretLinkRegenerateResponse = z.infer<
  typeof playlistSecretLinkRegenerateResponseSchema
>;

// ================================
// FullPlaylistDTO (Discovery/Feed)
// ================================

export const fullPlaylistSchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
    playlistSlug: z.string().trim().min(1),
    isLiked: z.boolean(),
    description: z.string(),
    isPrivate: z.boolean(),
    coverArtUrl: z.string().url(),
    totalDurationSeconds: z.number().int().nonnegative(),
    trackCount: z.number().int().nonnegative(),
    owner: z.object({
      id: z.number().int().nonnegative(),
      username: z.string().trim().min(1),
      displayName: z.string().trim().min(1),
      avatarUrl: z.string().url(),
      isFollowing: z.boolean(),
      followerCount: z.number().int().nonnegative(),
      trackCount: z.number().int().nonnegative(),
    }),
    genre: z.string().trim().min(1),
    createdAt: z.string().trim().min(1),
    tracks: z.array(
      z.object({
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
        access: z.enum(['BLOCKED', 'PREVIEW', 'PLAYABLE']),
      })
    ),
    secretToken: z.string().trim().min(1),
    firstTrackWaveformUrl: z.string().url(),
  })
  .passthrough();
export type FullPlaylistDTO = z.infer<typeof fullPlaylistSchema>;

// ================================
// PlaylistSummaryDTO
// ================================

export const playlistSummarySchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
    playlistSlug: z.string().trim().min(1),
    isLiked: z.boolean(),
    isPrivate: z.boolean(),
    coverArtUrl: z.string().url(),
    trackCount: z.number().int().nonnegative(),
    owner: z.object({
      id: z.number().int().nonnegative(),
      username: z.string().trim().min(1),
      displayName: z.string().trim().min(1),
      avatarUrl: z.string().url(),
      isFollowing: z.boolean(),
      followerCount: z.number().int().nonnegative(),
      trackCount: z.number().int().nonnegative(),
    }),
    genre: z.string().trim().min(1),
    tracks: z.array(
      z.object({
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
        access: z.enum(['BLOCKED', 'PREVIEW', 'PLAYABLE']),
      })
    ),
    secretToken: z.string().trim().min(1),
  })
  .passthrough();
export type PlaylistSummaryDTO = z.infer<typeof playlistSummarySchema>;

// ================================
// Playlist Likes
// ================================

export const playlistLikeResponseSchema = z
  .object({
    message: z.string().min(1),
    isLiked: z.boolean(),
  })
  .passthrough();
export type PlaylistLikeResponse = z.infer<typeof playlistLikeResponseSchema>;

// ================================
// Playlist Pagination
// ================================

export const paginatedPlaylistsResponseSchema = z.object({
  content: z.array(playlistResponseSchema),
  pageNumber: z.number().int().nonnegative(),
  pageSize: z.number().int().nonnegative(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  isLast: z.boolean(),
});
export type PaginatedPlaylistsResponse = z.infer<
  typeof paginatedPlaylistsResponseSchema
>;

// ================================
// Playlist Tracks
// ================================

/** DTO sent to POST /playlists/:playlistId/tracks */
export const addPlaylistTrackRequestSchema = z.object({
  trackId: z.number().int().nonnegative(),
});
export type AddPlaylistTrackRequest = z.infer<
  typeof addPlaylistTrackRequestSchema
>;

/** DTO sent to PATCH /playlists/:playlistId/tracks/reorder */
export const reorderPlaylistTracksRequestSchema = z.object({
  trackIds: z.array(z.number().int().nonnegative()).min(1),
});
export type ReorderPlaylistTracksRequest = z.infer<
  typeof reorderPlaylistTracksRequestSchema
>;
