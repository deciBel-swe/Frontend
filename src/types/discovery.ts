import { z } from 'zod';
import { paginatedResponseSchema } from './pagination';
import { fullPlaylistSchema } from './playlists';
import { fullTrackSchema, trackSummarySchema } from './tracks';
import { userSummarySchema } from './user';

// ================================
// Resource References
// ================================

export const resourceTypeSchema = z.enum(['TRACK', 'PLAYLIST', 'USER']);

export const resourceRefSchema = z.object({
  resourceType: resourceTypeSchema,
  resourceId: z.number().int().nonnegative(),
});
export type ResourceRefDTO = z.infer<typeof resourceRefSchema>;

export const resourceRefFullSchema = z
  .object({
    resourceType: resourceTypeSchema,
    resourceId: z.number().int().nonnegative(),
    playlist: fullPlaylistSchema.nullable(),
    track: fullTrackSchema.nullable(),
    user: userSummarySchema.nullable(),
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
    repostedBy: userSummarySchema.optional(),
    createdAt: z.string().trim().min(1),
  })
  .passthrough();
export type FeedItemDTO = z.infer<typeof feedItemSchema>;

export const paginatedFeedResponseSchema = paginatedResponseSchema(feedItemSchema);
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

export const paginatedStationResponseSchema = paginatedResponseSchema(
  stationItemSchema
);
export type PaginatedStationResponseDTO = z.infer<
  typeof paginatedStationResponseSchema
>;
