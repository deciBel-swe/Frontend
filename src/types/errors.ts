import { z } from 'zod';

export const errorEnvelopeSchema = z
  .object({
    status: z.number().int(),
    error: z.string(),
    message: z.string(),
  })
  .passthrough();
export type ErrorEnvelopeDTO = z.infer<typeof errorEnvelopeSchema>;
