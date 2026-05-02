import { z } from 'zod';

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(
  item: T
) =>
  z
    .object({
      content: z.array(item),
      pageNumber: z.number().int(),
      pageSize: z.number().int(),
      totalElements: z.number().int(),
      totalPages: z.number().int(),
      isLast: z.boolean(),
    })
    .passthrough();

export type PaginatedResponse<T> = z.infer<
  ReturnType<typeof paginatedResponseSchema<z.ZodType<T>>>
>;
