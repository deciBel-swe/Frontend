import { z } from 'zod';
import { paginatedResponseSchema } from './pagination';
import { trackSummarySchema } from './tracks';
import { DEFAULT_PROFILE_AVATAR_IMAGE, DEFAULT_PROFILE_COVER_IMAGE } from './user';
import { nullableStringWithDefault } from './user';
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
  type: playlistTypeSchema.optional(),
  isPrivate: z.boolean().optional(),
  CoverArt: z.string().optional(),
  genre: z.string().min(1),
});
export type CreatePlaylistRequest = z.infer<
  typeof createPlaylistRequestSchema
>;

export const playlistOwnerSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  displayName: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
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
    // API sends track data as trackSummary / trackSummaryDto depending on endpoint
    trackSummary: z.array(playlistTrackSchema).nullable().optional(),
    trackSummaryDto: z.array(playlistTrackSchema).nullable().optional(),
    playlistSlug: z.string().trim().min(1).optional(),
    description: z.string().nullable().optional(),
    isPrivate: z.boolean().optional(),
    coverArtUrl: z.string().nullable().optional(),
    totalDurationSeconds: z.number().int().nonnegative().optional(),
    trackCount: z.number().int().nonnegative().optional(),
    genre: z.string().optional(),
    // API sends genres as an array; normalized to genre below
    genres: z.array(z.string()).nullable().optional(),
    createdAt: z.string().optional(),
    secretToken: z.string().trim().optional(),
    firstTrackWaveformUrl: z.string().nullable().optional(),
    firstTrackWaveformData: z.unknown().optional(),
  })
  .passthrough()
  .transform((data) => ({
    ...data,
    // Normalize trackSummaryDto / trackSummary → tracks
    tracks:
      data.tracks.length > 0
        ? data.tracks
        : (data.trackSummaryDto ?? data.trackSummary ?? []),
    // Normalize genres array → genre string (first entry)
    genre: data.genre ?? data.genres?.[0],
  }));
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
    secretToken: z.string().trim(),
    secretUrl: z.string().trim().min(1).optional(),
    expiresAt: z.string().trim().min(1).optional(),
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
    coverArtUrl: nullableStringWithDefault(DEFAULT_PROFILE_COVER_IMAGE),
    totalDurationSeconds: z.number().int().nonnegative(),
    trackCount: z.number().int().nonnegative(),
    owner: z.object({
      id: z.number().int().nonnegative(),
      username: z.string().trim().min(1),
      displayName: z.string().trim().min(1),
      avatarUrl: nullableStringWithDefault(DEFAULT_PROFILE_AVATAR_IMAGE),
      isFollowing: z.boolean(),
      followerCount: z.number().int().nonnegative(),
      trackCount: z.number().int().nonnegative(),
    }),
    genre: z.string().trim().min(1).optional().default('if you are seeing this then something went wrong with backend'),
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
        secretToken: z.string().trim().optional().default('if-you-see-this-something-went-wrong'),
        access: z.enum(['BLOCKED', 'PREVIEW', 'PLAYABLE']),
      })
    ).optional().default([]),
    secretToken: z.string().trim().optional().default('if-you-see-this-something-went-wrong'),
    firstTrackWaveformUrl: z.string().url().nullable().optional(),
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
    coverArtUrl: nullableStringWithDefault(DEFAULT_PROFILE_COVER_IMAGE),
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
    genre: z.string().trim().min(1).optional().default('if you are seeing this then something went wrong with backend'),
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
        secretToken: z.string().trim(),
        access: z.enum(['BLOCKED', 'PREVIEW', 'PLAYABLE']),
      })
    ),
    secretToken: z.string().trim(),
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

const paginatedPlaylistsObjectSchema = z.object({
  content: z.array(playlistResponseSchema),
  // Support both Spring Page naming (number/size/last) and legacy naming (pageNumber/pageSize/isLast)
  pageNumber: z.number().int().nonnegative().optional(),
  number: z.number().int().nonnegative().optional(),
  pageSize: z.number().int().nonnegative().optional(),
  size: z.number().int().nonnegative().optional(),
  totalElements: z.number().int().nonnegative().optional(),
  totalPages: z.number().int().nonnegative().optional(),
  isLast: z.boolean().optional(),
  last: z.boolean().optional(),
});

export const paginatedPlaylistsResponseSchema = z
  .union([
    playlistResponseSchema,
    z.array(playlistResponseSchema),
    paginatedPlaylistsObjectSchema,
  ])
  .transform((data) => {
    if (!Array.isArray(data) && 'id' in data) {
      return {
        content: [data],
        pageNumber: 0,
        pageSize: 1,
        totalElements: 1,
        totalPages: 1,
        isLast: true,
      };
    }

    if (Array.isArray(data)) {
      return {
        content: data,
        pageNumber: 0,
        pageSize: data.length,
        totalElements: data.length,
        totalPages: data.length > 0 ? 1 : 0,
        isLast: true,
      };
    }

    return {
      content: data.content,
      pageNumber: data.pageNumber ?? data.number ?? 0,
      pageSize: data.pageSize ?? data.size ?? data.content.length,
      totalElements: data.totalElements ?? data.content.length,
      totalPages: data.totalPages ?? (data.content.length > 0 ? 1 : 0),
      isLast: data.isLast ?? data.last ?? true,
    };
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
    type: z.literal('PLAYLIST'),
    id: z.number().int().nonnegative(),
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
