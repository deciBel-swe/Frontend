import { z } from 'zod';
import { paginatedResponseSchema } from './pagination';
import { trackAccessSchema } from './tracks';
import { nullableStringWithDefault } from './user';

const normalizeFeedTrackPayload = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const payload = value as Record<string, unknown>;
  if (!('CompletedPlayCount' in payload) && 'completedPlayCount' in payload) {
    return {
      ...payload,
      CompletedPlayCount: payload.completedPlayCount,
    };
  }

  return payload;
};

export const feedTrackSchema = z.preprocess(
  normalizeFeedTrackPayload,
  z
    .object({
      id: z.number().int().nonnegative(),
      title: z.string().trim().min(1),
      trackSlug: nullableStringWithDefault(''),
      artist: z.object({
        id: z.number().int().nonnegative().optional(),
        username: z.string().trim().min(1),
        displayName: nullableStringWithDefault(''),
        avatarUrl: nullableStringWithDefault(''),
        isFollowing: z.boolean().optional(),
        followerCount: z.number().int().nonnegative().optional(),
        trackCount: z.number().int().nonnegative().optional(),
      }),
      trackUrl: z.string().trim().min(1).optional().nullable(),
      trackPreviewUrl: z.string().trim().min(1).optional().nullable(),
      coverUrl: z.string().trim().min(1).optional().nullable(),
      waveformUrl: z.string().trim().min(1).optional().nullable(),
      genre: z.string().trim().optional(),
      isReposted: z.boolean().optional(),
      isLiked: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      releaseDate: z.string().trim().optional().nullable(),
      playCount: z.number().int().nonnegative().optional(),
      CompletedPlayCount: z.number().int().nonnegative().optional(),
      likeCount: z.number().int().nonnegative().optional(),
      repostCount: z.number().int().nonnegative().optional(),
      commentCount: z.number().int().nonnegative().optional(),
      isPrivate: z.boolean().optional(),
      trackDurationSeconds: z.number().int().nonnegative().optional(),
      uploadDate: z.string().trim().optional().nullable(),
      description: nullableStringWithDefault(''),
      trendingRank: z.number().int().nonnegative().optional(),
      access: trackAccessSchema.optional(),
      secretToken: nullableStringWithDefault(''),
    })
    .passthrough()
);
export type FeedTrackDTO = z.infer<typeof feedTrackSchema>;

export const feedUserSummarySchema = z
  .object({
    id: z.number().int().nonnegative(),
    username: z.string().trim().min(1),
    displayName: nullableStringWithDefault(''),
    avatarUrl: nullableStringWithDefault(''),
    isFollowing: z.boolean().optional(),
    followerCount: z.number().int().nonnegative().optional(),
    trackCount: z.number().int().nonnegative().optional(),
  })
  .passthrough();
export type FeedUserSummaryDTO = z.infer<typeof feedUserSummarySchema>;

export const feedPlaylistTrackSchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
    trackSlug: nullableStringWithDefault(''),
    coverUrl: z.string().trim().min(1).optional().nullable(),
    trackUrl: z.string().trim().min(1).optional().nullable(),
    trackPreviewUrl: z.string().trim().min(1).optional().nullable(),
    artist: feedUserSummarySchema,
    playCount: z.number().int().nonnegative().optional(),
    likeCount: z.number().int().nonnegative().optional(),
    repostCount: z.number().int().nonnegative().optional(),
    commentCount: z.number().int().nonnegative().optional(),
    isLiked: z.boolean().optional(),
    isReposted: z.boolean().optional(),
    secretToken: nullableStringWithDefault(''),
    access: trackAccessSchema.optional(),
  })
  .passthrough();
export type FeedPlaylistTrackDTO = z.infer<typeof feedPlaylistTrackSchema>;

export const feedPlaylistSchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1),
    playlistSlug: nullableStringWithDefault(''),
    isLiked: z.boolean().optional(),
    isReposted: z.boolean().optional(),
    likeCount: z.number().int().nonnegative().optional(),
    repostCount: z.number().int().nonnegative().optional(),
    description: nullableStringWithDefault(''),
    isPrivate: z.boolean().optional(),
    coverArtUrl: z.string().trim().min(1).optional().nullable(),
    totalDurationSeconds: z.number().int().nonnegative().optional(),
    trackCount: z.number().int().nonnegative().optional(),
    owner: feedUserSummarySchema,
    genre: z.string().trim().optional(),
    createdAt: z.string().trim().optional(),
    tracks: z.array(feedPlaylistTrackSchema).optional().default([]),
    secretToken: nullableStringWithDefault(''),
    firstTrackWaveformUrl: z.string().trim().min(1).optional().nullable(),
    firstTrackWaveformData: z.unknown().optional(),
  })
  .passthrough();
export type FeedPlaylistDTO = z.infer<typeof feedPlaylistSchema>;

export const feedResourceTypeSchema = z.enum(['TRACK', 'PLAYLIST', 'USER']);

export const feedResourceRefSchema = z.object({
  type: feedResourceTypeSchema,
  id: z.number().int().nonnegative(),
});
export type FeedResourceRefDTO = z.infer<typeof feedResourceRefSchema>;

export const feedResourceRefFullSchema = z
  .object({
    type: feedResourceTypeSchema,
    id: z.number().int().nonnegative().optional(),
    playlist: feedPlaylistSchema.nullable(),
    track: feedTrackSchema.nullable(),
    user: feedUserSummarySchema.nullable(),
    repostedBy: feedUserSummarySchema.optional().nullable(),
    repostedAt: nullableStringWithDefault(''),
  })
  .passthrough();
export type FeedResourceRefFullDTO = z.infer<typeof feedResourceRefFullSchema>;

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
    resource: feedResourceRefFullSchema,
    actor: feedUserSummarySchema.optional().nullable(),
    likedBy: feedUserSummarySchema.optional().nullable(),
    repostedBy: feedUserSummarySchema.optional().nullable(),
    createdAt: z.string().trim().min(1),
  })
  .passthrough();
export type FeedItemDTO = z.infer<typeof feedItemSchema>;

export const paginatedFeedResponseSchema =
  paginatedResponseSchema(feedItemSchema);
export type PaginatedFeedResponseDTO = z.infer<
  typeof paginatedFeedResponseSchema
>;

export const paginatedTrackFeedResponseSchema = paginatedFeedResponseSchema;

export type PaginatedTrackFeedResponse = z.infer<
  typeof paginatedTrackFeedResponseSchema
>;
