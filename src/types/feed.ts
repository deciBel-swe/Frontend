import { z } from 'zod';
import {
  feedItemSchema,
  paginatedFeedResponseSchema,
} from './discovery';

export { feedItemSchema, paginatedFeedResponseSchema };

export const paginatedTrackFeedResponseSchema = paginatedFeedResponseSchema;

export type PaginatedTrackFeedResponse = z.infer<
  typeof paginatedTrackFeedResponseSchema
>;
