import { z } from 'zod';
import { paginatedResponseSchema } from './pagination';
import { fullPlaylistSchema } from './playlists';
import { fullTrackSchema, trackSummarySchema } from './tracks';
import { nullableStringWithDefault, userSummarySchema } from './user';

// ================================
// Resource References
// ================================

export const resourceTypeSchema = z.enum(['TRACK', 'PLAYLIST', 'USER']);

export const resourceRefSchema = z.object({
  type: resourceTypeSchema,
  id: z.number().int().nonnegative(),
});
export type ResourceRefDTO = z.infer<typeof resourceRefSchema>;

export const resourceRefFullSchema = z
  .object({
    type: resourceTypeSchema,
    id: z.number().int().nonnegative().optional(),
    playlist: fullPlaylistSchema.nullable(),
    track: fullTrackSchema.nullable(),
    user: userSummarySchema.nullable(),
    repostedBy: userSummarySchema.optional().nullable(),
    repostedAt: nullableStringWithDefault(''),
  })
  .passthrough();
export type ResourceRefFullDTO = z.infer<typeof resourceRefFullSchema>;

// ================================
// Feed
// ================================

export const feedItemTypeSchema = z.enum([
  'TRACK_POSTED',
  'TRACK_REPOSTED',
  'PLAYLIST_POSTED',
  'PLAYLIST_REPOSTED',
  'TRACK_LIKED',
  'PLAYLIST_LIKED',
]);

export const feedItemSchema = z
  .object({
    id: z.number().int().nonnegative(),
    type: feedItemTypeSchema,
    resource: resourceRefFullSchema,
    actor: userSummarySchema.optional().nullable(),
    likedBy: userSummarySchema.optional().nullable(),
    repostedBy: userSummarySchema.optional().nullable(),
    createdAt: z.string().trim().min(1),
  })
  .passthrough();
export type FeedItemDTO = z.infer<typeof feedItemSchema>;

export const paginatedFeedResponseSchema =
  paginatedResponseSchema(feedItemSchema);
export type PaginatedFeedResponseDTO = z.infer<
  typeof paginatedFeedResponseSchema
>;

// ================================
// Search
// ================================

export const paginatedSearchResponseSchema = paginatedResponseSchema(
  resourceRefFullSchema
);
export type PaginatedSearchResponseDTO = z.infer<
  typeof paginatedSearchResponseSchema
>;

const repostTrackArtistSchema = z
  .object({
    id: z.number().int().nonnegative().optional(),
    username: z.string().trim().min(1),
    displayName: z.string().trim().optional(),
    avatarUrl: z.string().url().optional().nullable(),
    isFollowing: z.boolean().optional(),
    followerCount: z.number().int().nonnegative().optional(),
    trackCount: z.number().int().nonnegative().optional(),
  })
  .passthrough();

const flatRepostTrackSchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
    trackSlug: z.string().trim().min(1).optional().nullable(),
    artist: repostTrackArtistSchema,
    trackUrl: z.string().url(),
    trackPreviewUrl: z.string().url().optional().nullable(),
    coverUrl: z.string().url().optional().nullable(),
    waveformUrl: z.string().url().optional().nullable(),
    genre: z.string().trim().optional(),
    isReposted: z.boolean().optional(),
    isLiked: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    releaseDate: z.string().trim().optional(),
    playCount: z.number().int().nonnegative().optional(),
    completedPlayCount: z.number().int().nonnegative().optional(),
    CompletedPlayCount: z.number().int().nonnegative().optional(),
    likeCount: z.number().int().nonnegative().optional(),
    repostCount: z.number().int().nonnegative().optional(),
    commentCount: z.number().int().nonnegative().optional(),
    isPrivate: z.boolean().optional(),
    trackDurationSeconds: z.number().int().nonnegative().optional(),
    uploadDate: z.string().trim().optional(),
    description: nullableStringWithDefault(''),
    access: z.enum(['BLOCKED', 'PREVIEW', 'PLAYABLE']).optional(),
    secretToken: z.string().trim().optional(),
    repostedBy: userSummarySchema.optional().nullable(),
    repostedAt: nullableStringWithDefault(''),
  })
  .passthrough();

const flatRepostPlaylistTrackSchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
    trackSlug: z.string().trim().min(1),
    coverUrl: z.string().url().optional().nullable(),
    trackUrl: z.string().url(),
    trackPreviewUrl: z.string().url().optional().nullable(),
    artist: repostTrackArtistSchema,
    playCount: z.number().int().nonnegative().optional(),
    likeCount: z.number().int().nonnegative().optional(),
    repostCount: z.number().int().nonnegative().optional(),
    commentCount: z.number().int().nonnegative().optional(),
    isLiked: z.boolean().optional(),
    isReposted: z.boolean().optional(),
    secretToken: z.string().trim().optional(),
    access: z.enum(['BLOCKED', 'PREVIEW', 'PLAYABLE']).optional(),
  })
  .passthrough();

const flatRepostPlaylistSchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
    playlistSlug: z.string().trim().min(1),
    isLiked: z.boolean().optional(),
    isReposted: z.boolean().optional(),
    description: z.string().optional(),
    isPrivate: z.boolean().optional(),
    coverArtUrl: z.string().url().optional().nullable(),
    totalDurationSeconds: z.number().int().nonnegative().optional(),
    trackCount: z.number().int().nonnegative().optional(),
    owner: z
      .object({
        id: z.number().int().nonnegative().optional(),
        username: z.string().trim().min(1),
        displayName: z.string().trim().optional(),
        avatarUrl: z.string().url().optional().nullable(),
        isFollowing: z.boolean().optional(),
        followerCount: z.number().int().nonnegative().optional(),
        trackCount: z.number().int().nonnegative().optional(),
      })
      .passthrough(),
    genre: z.string().trim().optional(),
    createdAt: z.string().trim().optional(),
    tracks: z.array(flatRepostPlaylistTrackSchema).optional().default([]),
    secretToken: z.string().trim().optional(),
    firstTrackWaveformUrl: z.string().url().optional().nullable(),
    firstTrackWaveformData: z.unknown().optional(),
    repostedBy: userSummarySchema.optional().nullable(),
    repostedAt: nullableStringWithDefault(''),
  })
  .passthrough();

export const repostResourceSchema = z.union([
  resourceRefFullSchema,
  flatRepostTrackSchema,
  flatRepostPlaylistSchema,
]);
export type RepostResourceDTO = z.infer<typeof repostResourceSchema>;

export const paginatedRepostResponseSchema =
  paginatedResponseSchema(repostResourceSchema);
export type PaginatedRepostResponseDTO = z.infer<
  typeof paginatedRepostResponseSchema
>;

// ================================
// Trending
// ================================

export const trendingTracksResponseSchema = z.array(resourceRefFullSchema);
export type TrendingTracksResponseDTO = z.infer<
  typeof trendingTracksResponseSchema
>;

// ================================
// Stations
// ================================

export const stationItemSchema = z
  .object({
    id: z.number().int().nonnegative(),
    type: z.literal('TRACK'),
    track: trackSummarySchema,
    createdAt: z.string().trim().min(1),
  })
  .passthrough();
export type StationItemDTO = z.infer<typeof stationItemSchema>;

export const paginatedStationResponseSchema =
  paginatedResponseSchema(stationItemSchema);
export type PaginatedStationResponseDTO = z.infer<
  typeof paginatedStationResponseSchema
>;
