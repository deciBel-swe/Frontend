import { z } from 'zod';
import { messageResponseSchema } from './user'; // Assuming ActionMessageDTO maps to this

export const subscriptionStatusSchema = z.enum([
  'active',
  'cancelled',
  'past_due',
  'trialing',
]);
export type SubscriptionStatusEnum = z.infer<typeof subscriptionStatusSchema>;

export const checkoutResponseSchema = z.object({
  checkoutUrl: z.string().url(),
});
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;

export const subscriptionStatusDTOSchema = z.object({
  status: subscriptionStatusSchema,
  plan: z.string(),
  currentPeriodEnd: z.number().int().nullable(),
  cancelAtPeriodEnd: z.boolean(),
});
export type SubscriptionStatusDTO = z.infer<typeof subscriptionStatusDTOSchema>;

export const cancelSubscriptionResponseSchema = messageResponseSchema.extend({
  cancelAtPeriodEnd: z.boolean(),
});
export type CancelSubscriptionResponse = z.infer<
  typeof cancelSubscriptionResponseSchema
>;

export const renewSubscriptionResponseSchema = messageResponseSchema.extend({
  cancelAtPeriodEnd: z.boolean(),
  status: subscriptionStatusSchema,
});
export type RenewSubscriptionResponse = z.infer<
  typeof renewSubscriptionResponseSchema
>;
