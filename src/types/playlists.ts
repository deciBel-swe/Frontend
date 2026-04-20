import { z } from 'zod';
import { paginatedResponseSchema } from './pagination';
import { trackSummarySchema } from './tracks';

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
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
  isFollowing: z.boolean().optional(),
  followerCount: z.number().int().nonnegative().optional(),
  trackCount: z.number().int().nonnegative().optional(),
});
export type PlaylistOwner = z.infer<typeof playlistOwnerSchema>;

export const legacyPlaylistTrackSchema = z.object({
  trackId: z.number().int(),
  title: z.string(),
  durationSeconds: z.number().int(),
  trackUrl: z.string().url(),
});
export const playlistTrackSchema = z
  .union([legacyPlaylistTrackSchema, trackSummarySchema]);
export type PlaylistTrack = z.infer<typeof playlistTrackSchema>;

/** DTO returned by POST /playlists */
export const playlistResponseSchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
    type: playlistTypeSchema.optional(),
    isLiked: z.boolean().optional().default(false),
    isReposted: z.boolean().optional().default(false),
    likeCount: z.number().int().nonnegative().optional(),
    repostCount: z.number().int().nonnegative().optional(),
    owner: playlistOwnerSchema.optional(),
    tracks: z.array(playlistTrackSchema).optional().default([]),
    playlistSlug: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    isPrivate: z.boolean().optional(),
    coverArtUrl: z.string().optional(),
    totalDurationSeconds: z.number().int().nonnegative().optional(),
    trackCount: z.number().int().nonnegative().optional(),
    genre: z.string().optional(),
    createdAt: z.string().optional(),
    secretToken: z.string().trim().min(1).optional(),
    firstTrackWaveformUrl: z.string().optional(),
    firstTrackWaveformData: z.unknown().optional(),
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
export const playlistUpdateResponseSchema = playlistResponseSchema;
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
  .union([
    z.object({
      secretToken: z.string().trim().min(1),
    }),
    z.object({
      SecretLink: z.string().trim().min(1),
    }),
  ])
  .transform((payload) => ({
    secretToken:
      'secretToken' in payload ? payload.secretToken : payload.SecretLink,
  }));
export type PlaylistSecretLinkResponse = z.infer<
  typeof playlistSecretLinkResponseSchema
>;

/** DTO returned by POST /playlists/:playlistId/secret-link/regenerate */
export const playlistSecretLinkRegenerateResponseSchema = z
  .object({
    secretToken: z.string().trim().min(1).optional(),
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
    isReposted: z.boolean().optional(),
    likeCount: z.number().int().nonnegative().optional(),
    repostCount: z.number().int().nonnegative().optional(),
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
    firstTrackWaveformData: z.unknown().optional(),
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

export const playlistRepostResponseSchema = z
  .object({
    message: z.string().min(1),
    isReposted: z.boolean(),
  })
  .passthrough();
export type PlaylistRepostResponse = z.infer<typeof playlistRepostResponseSchema>;

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

export const paginatedPlaylistTracksResponseSchema =
  paginatedResponseSchema(trackSummarySchema);
export type PaginatedPlaylistTracksResponse = z.infer<
  typeof paginatedPlaylistTracksResponseSchema
>;

export const playlistResourceRefSchema = z
  .object({
    resourceType: z.literal('PLAYLIST'),
    resourceId: z.number().int().nonnegative(),
  })
  .passthrough();
export type PlaylistResourceRef = z.infer<typeof playlistResourceRefSchema>;

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
