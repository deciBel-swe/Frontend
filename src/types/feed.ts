import { z } from 'zod';
export const trackArtistSchema = z
  .object({
    id: z.number().optional(),
    username: z.string().optional(),
  })
  .passthrough();

export const feedTrackSchema = z
  .object({
    artist: trackArtistSchema,
    coverUrl: z.string().url().optional(),
    description: z.string().optional(),
    genre: z.string(),
    id: z.number(),
    isLiked: z.boolean(),
    isReposted: z.boolean(),
    likeCount: z.number(),
    playCount: z.number(),
    releaseDate: z.string(),
    repostCount: z.number(),
    tags: z.array(z.string()).optional(),
    title: z.string(),
    trackUrl: z.string().url(),
    uploadDate: z.string().optional(),
    waveformUrl: z.string().url(),
  })
  .passthrough();

export const paginatedTrackFeedResponseSchema = z
  .object({
    content: z.array(feedTrackSchema).optional(),
    isLast: z.boolean().optional(),
    pageNumber: z.number().optional(),
    pageSize: z.number().optional(),
    totalElements: z.number().optional(),
    totalPages: z.number().optional(),
  })
  .passthrough();

export type PaginatedTrackFeedResponse = z.infer<
  typeof paginatedTrackFeedResponseSchema
>;
